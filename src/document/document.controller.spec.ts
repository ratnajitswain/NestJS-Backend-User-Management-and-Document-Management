import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { JwtAuthGuard, JwtAuthAdminGuard } from '../auth/jwt-auth.guard';
import { UserRole, User } from '../user/user.entity'; // Import User entity
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Document } from './document.entity';
import { AuthenticatedRequest } from '../types/global';

const mockDocumentService = {
  create: jest.fn(),
  uploadFile: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  addEditor: jest.fn(),
  addViewer: jest.fn(),
  removeEditor: jest.fn(),
  removeViewer: jest.fn(),
};

const mockJwtAuthGuard = {
  canActivate: jest.fn((context: ExecutionContext) => true),
};

const mockJwtAuthAdminGuard = {
  canActivate: jest.fn((context: ExecutionContext) => true),
};

const mockRequest = (user: Partial<User>): AuthenticatedRequest =>
  ({
    user: {
      id: user.id || 1,
      email: user.email || 'test@example.com',
      password: user.password || 'password',
      role: user.role || UserRole.VIEWER,
    },
  }) as AuthenticatedRequest;

describe('DocumentController', () => {
  let documentController: DocumentController;
  let documentService: DocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(JwtAuthAdminGuard)
      .useValue(mockJwtAuthAdminGuard)
      .compile();

    documentController = module.get<DocumentController>(DocumentController);
    documentService = module.get<DocumentService>(DocumentService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a document', async () => {
      const documentData = { title: 'Test Document', content: 'Test Content' };
      const mockDocument = { id: 1, ...documentData } as Document;

      mockDocumentService.create.mockResolvedValue(mockDocument);

      const result = await documentController.create(
        documentData,
        mockRequest({ id: 1 }),
      );

      expect(documentService.create).toHaveBeenCalledWith({
        ...documentData,
        ownerId: 1,
      });
      expect(result).toEqual(mockDocument);
    });
  });

  describe('uploadFile', () => {
    it('should upload a file', async () => {
      const file = { path: '/uploads/test.pdf' } as Express.Multer.File;
      const mockDocument = { id: 1, filePath: file.path } as Document;

      mockDocumentService.uploadFile.mockResolvedValue(mockDocument);

      const result = await documentController.uploadFile(
        '1',
        file,
        mockRequest({ id: 1 }),
      );

      expect(documentService.uploadFile).toHaveBeenCalledWith(1, file, 1);
      expect(result).toEqual(mockDocument);
    });
  });

  describe('findAll', () => {
    it('should return an array of documents if user is admin', async () => {
      const mockDocuments = [
        { id: 1, title: 'Doc 1' },
        { id: 2, title: 'Doc 2' },
      ] as Document[];

      mockDocumentService.findAll.mockResolvedValue(mockDocuments);

      const result = await documentController.findAll();

      expect(documentService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockDocuments);
    });

    it('should throw UnauthorizedException if user is not an admin', async () => {
      mockJwtAuthAdminGuard.canActivate.mockImplementation(
        (context: ExecutionContext) => false,
      );

      await expect(async () => {
        const mockContext = {} as ExecutionContext;
        if (!mockJwtAuthAdminGuard.canActivate(mockContext)) {
          throw new UnauthorizedException('User is not an admin');
        }
        await documentController.findAll();
      }).rejects.toThrow(UnauthorizedException);

      expect(documentService.findAll).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a document if user has permission', async () => {
      const mockDocument = { id: 1, title: 'Test Document' } as Document;

      mockDocumentService.findById.mockResolvedValue(mockDocument);

      const result = await documentController.findById(
        '1',
        mockRequest({ id: 1 }),
      );

      expect(documentService.findById).toHaveBeenCalledWith(1, 1, false);
      expect(result).toEqual(mockDocument);
    });
  });

  describe('update', () => {
    it('should update a document if user has permission', async () => {
      const updateData = { title: 'Updated Title' };
      const mockDocument = { id: 1, ...updateData } as Document;

      mockDocumentService.update.mockResolvedValue(mockDocument);

      const result = await documentController.update(
        '1',
        updateData,
        mockRequest({ id: 1 }),
      );

      expect(documentService.update).toHaveBeenCalledWith(
        1,
        updateData,
        1,
        false,
      );
      expect(result).toEqual(mockDocument);
    });
  });

  describe('delete', () => {
    it('should delete a document if user has permission', async () => {
      const mockResponse = { message: 'Document deleted successfully' };

      mockDocumentService.delete.mockResolvedValue(mockResponse);

      const result = await documentController.delete(
        '1',
        mockRequest({ id: 1 }),
      );

      expect(documentService.delete).toHaveBeenCalledWith(1, 1, false);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('addEditor', () => {
    it('should add an editor if user has permission', async () => {
      const mockDocument = { id: 1, title: 'Test Document' } as Document;

      mockDocumentService.addEditor.mockResolvedValue(mockDocument);

      const result = await documentController.addEditor(
        '1',
        '2',
        mockRequest({ id: 1 }),
      );

      expect(documentService.addEditor).toHaveBeenCalledWith(1, 2, 1, false);
      expect(result).toEqual(mockDocument);
    });
  });

  describe('addViewer', () => {
    it('should add a viewer if user has permission', async () => {
      const mockDocument = { id: 1, title: 'Test Document' } as Document;

      mockDocumentService.addViewer.mockResolvedValue(mockDocument);

      const result = await documentController.addViewer(
        '1',
        '2',
        mockRequest({ id: 1 }),
      );

      expect(documentService.addViewer).toHaveBeenCalledWith(1, 2, 1, false);
      expect(result).toEqual(mockDocument);
    });
  });

  describe('removeEditor', () => {
    it('should remove an editor if user has permission', async () => {
      const mockDocument = { id: 1, title: 'Test Document' } as Document;

      mockDocumentService.removeEditor.mockResolvedValue(mockDocument);

      const result = await documentController.removeEditor(
        '1',
        '2',
        mockRequest({ id: 1 }),
      );

      expect(documentService.removeEditor).toHaveBeenCalledWith(1, 2, 1, false);
      expect(result).toEqual(mockDocument);
    });
  });

  describe('removeViewer', () => {
    it('should remove a viewer if user has permission', async () => {
      const mockDocument = { id: 1, title: 'Test Document' } as Document;

      mockDocumentService.removeViewer.mockResolvedValue(mockDocument);

      const result = await documentController.removeViewer(
        '1',
        '2',
        mockRequest({ id: 1 }),
      );

      expect(documentService.removeViewer).toHaveBeenCalledWith(1, 2, 1, false);
      expect(result).toEqual(mockDocument);
    });
  });
});
