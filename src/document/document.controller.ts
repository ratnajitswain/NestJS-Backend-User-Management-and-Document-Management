import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { JwtAuthAdminGuard, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../types/global';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './multer.config';
import { UserRole } from '../user/user.entity';

@Controller('documents')
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  private getUserDetails(req: AuthenticatedRequest) {
    return { userId: req.user.id, isAdmin: req.user.role === UserRole.ADMIN };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() documentData: { title: string; content: string },
    @Req() req: AuthenticatedRequest,
  ) {
    return this.documentService.create({
      ...documentData,
      ownerId: req.user.id,
    });
  }

  @Post(':id/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.documentService.uploadFile(parseInt(id), file, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthAdminGuard)
  async findAll() {
    return this.documentService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const { userId, isAdmin } = this.getUserDetails(req);
    return this.documentService.findById(parseInt(id), userId, isAdmin);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Document>,
    @Req() req: AuthenticatedRequest,
  ) {
    const { userId, isAdmin } = this.getUserDetails(req);
    return this.documentService.update(
      parseInt(id),
      updateData,
      userId,
      isAdmin,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const { userId, isAdmin } = this.getUserDetails(req);
    return this.documentService.delete(parseInt(id), userId, isAdmin);
  }

  private async manageAccess(
    action: 'add' | 'remove',
    role: 'editor' | 'viewer',
    documentId: string,
    userId: string,
    req: AuthenticatedRequest,
  ) {
    const { userId: requesterId, isAdmin } = this.getUserDetails(req);
    return action === 'add'
      ? this.documentService[
          `add${role.charAt(0).toUpperCase() + role.slice(1)}`
        ](parseInt(documentId), parseInt(userId), requesterId, isAdmin)
      : this.documentService[
          `remove${role.charAt(0).toUpperCase() + role.slice(1)}`
        ](parseInt(documentId), parseInt(userId), requesterId, isAdmin);
  }

  @Post(':id/add-editor/:editorId')
  @UseGuards(JwtAuthGuard)
  async addEditor(
    @Param('id') documentId: string,
    @Param('editorId') editorId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.manageAccess('add', 'editor', documentId, editorId, req);
  }

  @Post(':id/add-viewer/:viewerId')
  @UseGuards(JwtAuthGuard)
  async addViewer(
    @Param('id') documentId: string,
    @Param('viewerId') viewerId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.manageAccess('add', 'viewer', documentId, viewerId, req);
  }

  @Delete(':id/remove-editor/:editorId')
  @UseGuards(JwtAuthGuard)
  async removeEditor(
    @Param('id') documentId: string,
    @Param('editorId') editorId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.manageAccess('remove', 'editor', documentId, editorId, req);
  }

  @Delete(':id/remove-viewer/:viewerId')
  @UseGuards(JwtAuthGuard)
  async removeViewer(
    @Param('id') documentId: string,
    @Param('viewerId') viewerId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.manageAccess('remove', 'viewer', documentId, viewerId, req);
  }
}
