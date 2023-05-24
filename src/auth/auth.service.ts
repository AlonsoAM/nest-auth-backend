import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, ...userData } = createUserDto;
      // 1. Encriptar la contraseña
      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userData,
      });

      // 2. Guardar el usuario
      await newUser.save();

      // 3. Quitar el password del objeto que retorna como respuesta
      const { password: _, ...user } = newUser.toJSON();

      // 4. Reotornar usuario
      return user;
    } catch (error) {
      // 4. Manejar los errores
      if (error.code === 11000) {
        throw new BadRequestException(`${createUserDto.email} ya existe!`);
      }
      throw new InternalServerErrorException('Algo terrible sucedió!');
    }
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
