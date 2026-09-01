import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { HashUtil } from "../../common/utils/hash.util";
import { PaginationUtil } from "../../common/utils/pagination.util";
import { Prisma, Role, UserStatus } from "@prisma/client";
import { CreateUserDto, UpdateUserDto, UpdateProfileDto, UserQueryDto } from "./dto/user.dto";

const userSelect = {
  id: true, email: true, username: true, firstName: true, lastName: true,
  avatarUrl: true, phoneNumber: true, role: true, status: true, isEmailVerified: true,
  lastLoginAt: true, createdAt: true, updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: UserQueryDto) {
    const { skip, take, page, limit } = PaginationUtil.getSkipTake(query);
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(query.role ? { role: query.role } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search ? {
        OR: [
          { email: { contains: query.search, mode: "insensitive" } },
          { username: { contains: query.search, mode: "insensitive" } },
          { firstName: { contains: query.search, mode: "insensitive" } },
          { lastName: { contains: query.search, mode: "insensitive" } },
        ],
      } : {}),
    };
    const orderBy: Prisma.UserOrderByWithRelationInput = { [query.sortBy || "createdAt"]: query.sortOrder || "desc" };
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip, take, orderBy, select: userSelect }),
      this.prisma.user.count({ where }),
    ]);
    return PaginationUtil.paginate(users, total, page, limit);
  }

  async findById(id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null }, select: userSelect });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email.toLowerCase() }, dto.username ? { username: dto.username } : {}] },
    });
    if (existing) throw new ConflictException("User with this email or username already exists");

    const hashedPassword = await HashUtil.hash(dto.password);
    return this.prisma.user.create({
      data: { email: dto.email.toLowerCase(), username: dto.username || null, password: hashedPassword, firstName: dto.firstName || null, lastName: dto.lastName || null, role: dto.role || Role.USER, status: dto.status || UserStatus.ACTIVE },
      select: userSelect,
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data: { firstName: dto.firstName, lastName: dto.lastName, avatarUrl: dto.avatarUrl, phoneNumber: dto.phoneNumber, role: dto.role, status: dto.status },
      select: userSelect,
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.findById(userId);
    return this.prisma.user.update({
      where: { id: userId },
      data: { firstName: dto.firstName, lastName: dto.lastName, avatarUrl: dto.avatarUrl, phoneNumber: dto.phoneNumber },
      select: userSelect,
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.user.update({ where: { id }, data: { deletedAt: new Date(), status: UserStatus.INACTIVE } });
    return { message: "User deleted successfully" };
  }
}
