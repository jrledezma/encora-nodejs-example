import { ActionToTakeDocumentInterface, ActionToTakeSchema } from './action-to-take.model';
import { ClientDocumentInterface, ClientSchema } from './client.model';
import {
  ClientDealTrackingDocumentInterface,
  ClientDealTrackingSchema
} from './client-deal-tracking.model';
import {
  ClientCommunicationTrackingCommentDocumentInterface,
  ClientCommunicationTrackingCommentSchema
} from './client-communication-tracking-comment.model';
import {
  ClientCommunicationTrackingInvitationDocumentInterface,
  ClientCommunicationTrackingInvitationSchema
} from './client-communication-tracking-invitation.model';
import {
  ClientCommunicationWayDocumentInterface,
  ClientCommunicationWaySchema
} from './client-communication-way.model';
import {
  ClientDealDocumentInterface,
  ClientDealSchema
} from './client-deal.model';
import {
  ClientNoteDocumentInterface,
  ClientNoteSchema
} from './client-note.model';
import {
  ClientWayOfEntryDocumentInterface,
  ClientWayOfEntrySchema
} from './client-way-of-entry.model';
import {
  NoteTypeDocumentInterface,
  NoteTypeSchema
} from './note-type.model';
import {
  PaymentTypeDocumentInterface,
  PaymentTypeSchema
} from './payment-types.model';
import {
  ProjectStatusDocumentInterface,
  ProjectStatusSchema
} from './project-status.model';
import { UserDocumentInterface, UserSchema } from './user.model';

export {
  //Documents
  ActionToTakeDocumentInterface,
  ClientDocumentInterface,
  ClientCommunicationTrackingCommentDocumentInterface,
  ClientDealTrackingDocumentInterface,
  ClientCommunicationTrackingInvitationDocumentInterface,
  ClientCommunicationWayDocumentInterface,
  ClientDealDocumentInterface,
  ClientNoteDocumentInterface,
  ClientWayOfEntryDocumentInterface,
  NoteTypeDocumentInterface,
  PaymentTypeDocumentInterface,
  ProjectStatusDocumentInterface,
  UserDocumentInterface,
  //Schema
  ActionToTakeSchema,
  ClientDealTrackingSchema,
  ClientCommunicationTrackingCommentSchema,
  ClientCommunicationTrackingInvitationSchema,
  ClientCommunicationWaySchema,
  ClientDealSchema,
  ClientNoteSchema,
  ClientSchema,
  ClientWayOfEntrySchema,
  NoteTypeSchema,
  PaymentTypeSchema,
  ProjectStatusSchema,
  UserSchema
};
