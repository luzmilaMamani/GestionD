import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { Persona } from "../persona/persona.entity";
import { PersonaRol } from "../persona-rol/persona-rol.entity";
import { LoginDto } from "./dto/login.dto";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("Auth")
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Persona)
    private personaRepository: Repository<Persona>,
    @InjectRepository(PersonaRol)
    private personaRolRepository: Repository<PersonaRol>,
    private jwtService: JwtService,
  ) {}

  @ApiOperation({ summary: "Validar usuario y contraseña" })
  async validateUser(email: string, password: string): Promise<any> {
    const persona = await this.personaRepository.findOne({
      where: { email },
    });

    if (!persona || !persona.password) {
      return null;
    }

    const match = await bcrypt.compare(password, persona.password);
    if (!match) {
      return null;
    }

    // Obtener roles
    const personaRoles = await this.personaRolRepository.find({
      where: { persona_id: persona.id },
      relations: ["rol"],
    });

    const roles = personaRoles.map((pr) => pr.rol.nombre);
    const { password: _pw, ...result } = persona;
    return { ...result, roles };
  }

  @ApiOperation({ summary: "Iniciar sesión" })
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException("Credenciales inválidas");
    }

    const payload = {
      email: user.email,
      sub: user.id,
      roles: user.roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  @ApiOperation({ summary: "Registrar un nuevo usuario" })
  async register(
    personaData: Partial<Persona>,
    password: string,
  ): Promise<Persona> {
    const hashedPassword = await bcrypt.hash(password, 10);

    const persona = this.personaRepository.create({
      ...personaData,
      password: hashedPassword,
    });

    return await this.personaRepository.save(persona);
  }
}
