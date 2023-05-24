import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { LoginDto } from './dto/login.dto';

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

  async login(loginDto: LoginDto) {
    // 1. obtener la data del loginDTO
    const { email, password } = loginDto;
    // 1. Buscar al usuario desde el email
    const user = await this.userModel.findOne({ email });
    // 3. Verificar si el usuario existe
    if (!user) {
      throw new UnauthorizedException('Usuario incorreto!');
    }
    // 4. Verificar la contraseña
    if (!bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('Password Inválido!');
    }

    // Obtener los datos del usuario a retornar, expluyendo la constraseña
    const { password: _, ...rest } = user.toJSON();

    // Retornar la respuesta
    return {
      user: rest,
      token: '123',
    };
    /*
     * User -> {_id, mane, email, roles}
     * Token -> ASFasfds.asfsadfuasdigjadfsadfgadsg.sdfsadfas
     */
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
