import { ServiceResultInterface } from "../service-result.interface";
import { ClientNoteModelInterface } from "../models";

export interface ClientNotesServiceInterface {
	Create(
		obj: ClientNoteModelInterface,
		peopleToInvite?: any[],
		files?: any
	): Promise<ServiceResultInterface>;
	Modify(
		obj: ClientNoteModelInterface,
		peopleToInvite?: any[],
		stakeholdersToRevokeInvitations?: string[],
		files?: any
	): Promise<ServiceResultInterface>;
	LeaveNote(
		noteId: string,
		stakeholderId: string
	): Promise<ServiceResultInterface>;
	ArchiveNote(
		noteId: string,
		ownerId: string
	): Promise<ServiceResultInterface>;
	UnarchiveNote(
		noteId: string,
		ownerId: string
	): Promise<ServiceResultInterface>;
	GetAll(): Promise<ServiceResultInterface>;
	GetById(id: string, sessionUser: string): Promise<ServiceResultInterface>;
	Search(params: any): Promise<ServiceResultInterface>;
	GetClients(
		sessionUser: string,
		params?: any
	): Promise<ServiceResultInterface>;
	NotesByClient(
		clientId: string,
		sessionUser: string
	): Promise<ServiceResultInterface>;
}
