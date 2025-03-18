import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentService } from './document.service';
import { Document } from './document.entity';
import { User } from '../user/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('DocumentService', () => {
  let service: DocumentService;
  let documentRepository: Repository<Document>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: getRepositoryToken(Document),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    documentRepository = module.get<Repository<Document>>(
      getRepositoryToken(Document),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a document', async () => {
      const owner = { id: 1, name: 'John Doe' } as unknown as User;
      const documentData = {
        title: 'Test Document',
        content: 'Test Content',
        ownerId: 1,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(owner);
      jest
        .spyOn(documentRepository, 'create')
        .mockReturnValue({ ...documentData, owner } as unknown as Document);
      jest
        .spyOn(documentRepository, 'save')
        .mockResolvedValue({ ...documentData, owner } as unknown as Document);

      const result = await service.create(documentData);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(documentRepository.create).toHaveBeenCalledWith({
        ...documentData,
        owner,
        editors: [owner],
        viewers: [],
      });
      expect(documentRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ ...documentData, owner });
    });

    it('should throw NotFoundException if owner not found', async () => {
      const documentData = {
        title: 'Test Document',
        content: 'Test Content',
        ownerId: 1,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.create(documentData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all documents', async () => {
      const documents = [
        { id: 1, title: 'Doc 1' },
        { id: 2, title: 'Doc 2' },
      ] as Document[];

      jest.spyOn(documentRepository, 'find').mockResolvedValue(documents);

      const result = await service.findAll();

      expect(documentRepository.find).toHaveBeenCalledWith({
        relations: ['owner', 'editors', 'viewers'],
      });
      expect(result).toEqual(documents);
    });
  });

  describe('findById', () => {
    it('should return a document if user has permission', async () => {
      const document = {
        id: 1,
        title: 'Test Document',
        owner: { id: 1 },
        editors: [],
        viewers: [],
      } as unknown as Document;

      jest.spyOn(documentRepository, 'findOne').mockResolvedValue(document);

      const result = await service.findById(1, 1, false);

      expect(documentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['owner', 'editors', 'viewers'],
      });
      expect(result).toEqual(document);
    });

    it('should throw NotFoundException if document not found', async () => {
      jest.spyOn(documentRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findById(1, 1, false)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if user does not have permission', async () => {
      const document = {
        id: 1,
        title: 'Test Document',
        owner: { id: 2 },
        editors: [],
        viewers: [],
      } as unknown as Document;

      jest.spyOn(documentRepository, 'findOne').mockResolvedValue(document);

      await expect(service.findById(1, 1, false)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a document if user has permission', async () => {
      const document = {
        id: 1,
        title: 'Old Title',
        editors: [{ id: 1 }],
      } as Document;
      const updateData = { title: 'New Title' };

      jest.spyOn(documentRepository, 'findOne').mockResolvedValue(document);
      jest.spyOn(documentRepository, 'update').mockResolvedValue({} as any);
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue({ ...document, ...updateData } as Document);

      const result = await service.update(1, updateData, 1, false);

      expect(documentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['editors'],
      });
      expect(documentRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual({ ...document, ...updateData });
    });

    it('should throw NotFoundException if user does not have permission', async () => {
      const document = {
        id: 1,
        title: 'Old Title',
        editors: [{ id: 2 }],
      } as Document;

      jest.spyOn(documentRepository, 'findOne').mockResolvedValue(document);

      await expect(
        service.update(1, { title: 'New Title' }, 1, false),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a document if user has permission', async () => {
      const document = {
        id: 1,
        title: 'Test Document',
        owner: { id: 1 },
      } as Document;

      jest.spyOn(documentRepository, 'findOne').mockResolvedValue(document);
      jest.spyOn(documentRepository, 'delete').mockResolvedValue({} as any);

      const result = await service.delete(1, 1, false);

      expect(documentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['owner'],
      });
      expect(documentRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Document deleted successfully' });
    });

    it('should throw NotFoundException if user does not have permission', async () => {
      const document = {
        id: 1,
        title: 'Test Document',
        owner: { id: 2 },
      } as Document;

      jest.spyOn(documentRepository, 'findOne').mockResolvedValue(document);

      await expect(service.delete(1, 1, false)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('uploadFile', () => {
    it('should upload a file if user has permission', async () => {
      const document = {
        id: 1,
        title: 'Test Document',
        editors: [{ id: 1 }],
      } as Document;
      const file = { path: '/uploads/test.pdf' } as Express.Multer.File;

      jest.spyOn(documentRepository, 'findOne').mockResolvedValue(document);
      jest
        .spyOn(documentRepository, 'save')
        .mockResolvedValue({ ...document, filePath: file.path } as Document);

      const result = await service.uploadFile(1, file, 1);

      expect(documentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['editors'],
      });
      expect(documentRepository.save).toHaveBeenCalledWith({
        ...document,
        filePath: file.path,
      });
      expect(result).toEqual({ ...document, filePath: file.path });
    });

    it('should throw NotFoundException if user does not have permission', async () => {
      const document = {
        id: 1,
        title: 'Test Document',
        editors: [{ id: 2 }],
      } as Document;
      const file = { path: '/uploads/test.pdf' } as Express.Multer.File;

      jest.spyOn(documentRepository, 'findOne').mockResolvedValue(document);

      await expect(service.uploadFile(1, file, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addEditor', () => {
    it('should add an editor if user has permission', async () => {
      const document = {
        id: 1,
        title: 'Test Document',
        owner: { id: 1 },
        editors: [],
      } as unknown as Document;
      const editor = { id: 2, name: 'Editor' } as unknown as User;

      jest.spyOn(documentRepository, 'findOne').mockResolvedValue(document);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(editor);
      jest
        .spyOn(documentRepository, 'save')
        .mockResolvedValue({ ...document, editors: [editor] } as Document);

      const result = await service.addEditor(1, 2, 1, false);

      expect(documentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['editors', 'owner'],
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(documentRepository.save).toHaveBeenCalledWith({
        ...document,
        editors: [editor],
      });
      expect(result).toEqual({ ...document, editors: [editor] });
    });

    it('should throw NotFoundException if user does not have permission', async () => {
      const document = {
        id: 1,
        title: 'Test Document',
        owner: { id: 2 },
        editors: [],
      } as unknown as Document;

      jest.spyOn(documentRepository, 'findOne').mockResolvedValue(document);

      await expect(service.addEditor(1, 2, 1, false)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addViewer', () => {
    it('should add a viewer if user has permission', async () => {
      const document = {
        id: 1,
        title: 'Test Document',
        owner: { id: 1 },
        viewers: [],
      } as unknown as Document;
      const viewer = { id: 2, name: 'Viewer' } as unknown as User;

      jest.spyOn(documentRepository, 'findOne').mockResolvedValue(document);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(viewer);
      jest
        .spyOn(documentRepository, 'save')
        .mockResolvedValue({ ...document, viewers: [viewer] } as Document);

      const result = await service.addViewer(1, 2, 1, false);

      expect(documentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['viewers', 'owner'],
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(documentRepository.save).toHaveBeenCalledWith({
        ...document,
        viewers: [viewer],
      });
      expect(result).toEqual({ ...document, viewers: [viewer] });
    });

    it('should throw NotFoundException if user does not have permission', async () => {
      const document = {
        id: 1,
        title: 'Test Document',
        owner: { id: 2 },
        viewers: [],
      } as unknown as Document;

      jest.spyOn(documentRepository, 'findOne').mockResolvedValue(document);

      await expect(service.addViewer(1, 2, 1, false)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeEditor', () => {
    it('should remove an editor if user has permission', async () => {
      const document = {
        id: 1,
        title: 'Test Document',
        owner: { id: 1 },
        editors: [{ id: 2 }],
      } as Document;

      jest.spyOn(documentRepository, 'findOne').mockResolvedValue(document);
      jest
        .spyOn(documentRepository, 'save')
        .mockResolvedValue({ ...document, editors: [] } as Document);

      const result = await service.removeEditor(1, 2, 1, false);

      expect(documentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['editors', 'owner'],
      });
      expect(documentRepository.save).toHaveBeenCalledWith({
        ...document,
        editors: [],
      });
      expect(result).toEqual({ ...document, editors: [] });
    });

    it('should throw NotFoundException if user does not have permission', async () => {
      const document = {
        id: 1,
        title: 'Test Document',
        owner: { id: 2 },
        editors: [{ id: 2 }],
      } as Document;

      jest.spyOn(documentRepository, 'findOne').mockResolvedValue(document);

      await expect(service.removeEditor(1, 2, 1, false)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeViewer', () => {
    it('should remove a viewer if user has permission', async () => {
      const document = {
        id: 1,
        title: 'Test Document',
        owner: { id: 1 },
        viewers: [{ id: 2 }],
      } as Document;

      jest.spyOn(documentRepository, 'findOne').mockResolvedValue(document);
      jest
        .spyOn(documentRepository, 'save')
        .mockResolvedValue({ ...document, viewers: [] } as Document);

      const result = await service.removeViewer(1, 2, 1, false);

      expect(documentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['viewers', 'owner'],
      });
      expect(documentRepository.save).toHaveBeenCalledWith({
        ...document,
        viewers: [],
      });
      expect(result).toEqual({ ...document, viewers: [] });
    });

    it('should throw NotFoundException if user does not have permission', async () => {
      const document = {
        id: 1,
        title: 'Test Document',
        owner: { id: 2 },
        viewers: [{ id: 2 }],
      } as Document;

      jest.spyOn(documentRepository, 'findOne').mockResolvedValue(document);

      await expect(service.removeViewer(1, 2, 1, false)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
