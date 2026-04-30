import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Persona } from "./persona.entity";
import { CreatePersonaDto } from "./dto/create-persona.dto";
import { UpdatePersonaDto } from "./dto/update-persona.dto";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("Personas")
@Injectable()
export class PersonaService {
  constructor(
    @InjectRepository(Persona)
    private personaRepository: Repository<Persona>,
  ) {}

  @ApiOperation({ summary: "Crear una nueva persona" })
  async create(createPersonaDto: CreatePersonaDto): Promise<Persona> {
    const persona = this.personaRepository.create(createPersonaDto);
    return await this.personaRepository.save(persona);
  }

  @ApiOperation({ summary: "Obtener todas las personas" })
  async findAll(): Promise<Persona[]> {
    return await this.personaRepository.find();
  }

  @ApiOperation({ summary: "Obtener una persona por ID" })
  async findOne(id: number): Promise<Persona> {
    return await this.personaRepository.findOne({ where: { id } });
  }

  @ApiOperation({ summary: "Actualizar una persona" })
  async update(
    id: number,
    updatePersonaDto: UpdatePersonaDto,
  ): Promise<Persona> {
    await this.personaRepository.update(id, updatePersonaDto);
    return this.findOne(id);
  }

  @ApiOperation({ summary: "Eliminar una persona" })
  async remove(id: number): Promise<void> {
    await this.personaRepository.delete(id);
  }
}
