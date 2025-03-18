import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';
import { User } from '../user/user.entity';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(documentData: {
    title: string;
    content: string;
    ownerId: number;
  }) {
    const owner = await this.userRepository.findOne({
      where: { id: documentData.ownerId },
    });
    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    const document = this.documentRepository.create({
      ...documentData,
      owner,
      editors: [owner],
      viewers: [],
    });

    return this.documentRepository.save(document);
  }

  async findAll() {
    return this.documentRepository.find({
      relations: ['owner', 'editors', 'viewers'],
    });
  }

  async findById(id: number, userId: number, isAdmin: boolean) {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['owner', 'editors', 'viewers'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const isOwner = document.owner.id === userId;
    const isEditor = document.editors.some((editor) => editor.id === userId);
    const isViewer = document.viewers.some((viewer) => viewer.id === userId);

    if (!isAdmin && !isOwner && !isEditor && !isViewer) {
      throw new NotFoundException(
        'You do not have permission to view this document',
      );
    }

    return document;
  }

  async update(
    id: number,
    updateData: Partial<Document>,
    userId: number,
    isAdmin: boolean,
  ) {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['editors'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const isEditor = document.editors.some((editor) => editor.id === userId);
    if (!isAdmin && !isEditor) {
      throw new NotFoundException(
        'You do not have permission to edit this document',
      );
    }

    await this.documentRepository.update(id, updateData);
    return this.findById(id, userId, isAdmin);
  }

  async delete(id: number, userId: number, isAdmin: boolean) {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!isAdmin && document.owner.id !== userId) {
      throw new NotFoundException(
        'You do not have permission to delete this document',
      );
    }

    await this.documentRepository.delete(id);
    return { message: 'Document deleted successfully' };
  }

  async uploadFile(
    documentId: number,
    file: Express.Multer.File,
    userId: number,
  ) {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['editors'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const isEditor = document.editors.some((editor) => editor.id === userId);
    if (!isEditor) {
      throw new NotFoundException(
        'You do not have permission to upload files for this document',
      );
    }

    document.filePath = file.path;
    return this.documentRepository.save(document);
  }

  async addEditor(
    documentId: number,
    editorId: number,
    userId: number,
    isAdmin: boolean,
  ) {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['editors', 'owner'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!isAdmin && document.owner.id !== userId) {
      throw new NotFoundException('You do not have permission to add editors');
    }

    const editor = await this.userRepository.findOne({
      where: { id: editorId },
    });
    if (!editor) {
      throw new NotFoundException('Editor not found');
    }

    document.editors.push(editor);
    return this.documentRepository.save(document);
  }

  async addViewer(
    documentId: number,
    viewerId: number,
    userId: number,
    isAdmin: boolean,
  ) {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['viewers', 'owner'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!isAdmin && document.owner.id !== userId) {
      throw new NotFoundException('You do not have permission to add viewers');
    }

    const viewer = await this.userRepository.findOne({
      where: { id: viewerId },
    });
    if (!viewer) {
      throw new NotFoundException('Viewer not found');
    }

    document.viewers.push(viewer);
    return this.documentRepository.save(document);
  }

  async removeEditor(
    documentId: number,
    editorId: number,
    userId: number,
    isAdmin: boolean,
  ) {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['editors', 'owner'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!isAdmin && document.owner.id !== userId) {
      throw new NotFoundException(
        'You do not have permission to remove editors',
      );
    }

    document.editors = document.editors.filter(
      (editor) => editor.id !== editorId,
    );
    return this.documentRepository.save(document);
  }

  async removeViewer(
    documentId: number,
    viewerId: number,
    userId: number,
    isAdmin: boolean,
  ) {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['viewers', 'owner'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!isAdmin && document.owner.id !== userId) {
      throw new NotFoundException(
        'You do not have permission to remove viewers',
      );
    }

    document.viewers = document.viewers.filter(
      (viewer) => viewer.id !== viewerId,
    );
    return this.documentRepository.save(document);
  }
}
