import "reflect-metadata";
import { Container } from "inversify";
import { ApiTypes } from "./apiTypes";
import {
	ActionsToTakeServiceInterface,
	AuthServiceInterface,
	UserServiceInterface,
	TokenServiceInterface,
	MailServiceInterface,
	PaymentTypesServiceInterface,
	ClientWayOfEntriesServiceInterface,
	ClientsServiceInterface,
	ProjectStatusesServiceInterface,
	ClientCommunicationWaysServiceInterface,
	NoteTypesServiceInterface,
	ClientDealsTrackingServiceInterface,
	ConfigValuesServiceInterface,
	ClientCommunicationTrackingCommentsServiceInterface,
	ClientCommunicationTrackingInvitationsServiceInterface,
	ClientNotesServiceInterface,
	ClientDealsServiceInterface,
} from "./interfaces/services";
import {
	ActionsToTakeService,
	AuthService,
	UserService,
	TokenService,
	MailService,
	PaymentTypesService,
	ClientWayOfEntriesService,
	ClientsService,
	ProjectStatusesService,
	ClientCommunicationWaysService,
	NoteTypesService,
	ClientDealsTrackingService,
	ClientCommunicationTrackingCommentsService,
	ConfigValuesService,
	ClientCommunicationTrackingInvitationsService,
	ClientNotesService,
	ClientDealsService,
} from "./services";

let ApiContainer = new Container();
//TokenServiceInterface
ApiContainer.bind<TokenServiceInterface>(ApiTypes.tokenService).to(
	TokenService
);
//UserServiceInterface
ApiContainer.bind<UserServiceInterface>(ApiTypes.userService).to(UserService);
//AuthServiceInterface
ApiContainer.bind<AuthServiceInterface>(ApiTypes.authService).to(AuthService);
//MailServiceInterface
ApiContainer.bind<MailServiceInterface>(ApiTypes.mailService).to(MailService);
//PaymentTypesServiceInterface
ApiContainer.bind<PaymentTypesServiceInterface>(
	ApiTypes.paymentsTypesService
).to(PaymentTypesService);
//ClientWayOfEntriesServiceInterface
ApiContainer.bind<ClientWayOfEntriesServiceInterface>(
	ApiTypes.clientWayOfEntrieService
).to(ClientWayOfEntriesService);
//ClientsServiceInterface
ApiContainer.bind<ClientsServiceInterface>(ApiTypes.clientsService).to(
	ClientsService
);
//ProjectStatusesServiceInterface
ApiContainer.bind<ProjectStatusesServiceInterface>(
	ApiTypes.projectStatusesService
).to(ProjectStatusesService);
//ClientCommunicationWaysServiceInterface
ApiContainer.bind<ClientCommunicationWaysServiceInterface>(
	ApiTypes.clientCommunicationWaysService
).to(ClientCommunicationWaysService);
//ClientCommunicationsTrackingServiceInterface
ApiContainer.bind<ClientDealsTrackingServiceInterface>(
	ApiTypes.clientDealsTrackingService
).to(ClientDealsTrackingService);
//NoteTypesServiceInterface
ApiContainer.bind<NoteTypesServiceInterface>(ApiTypes.noteTypesService).to(
	NoteTypesService
);
//ClientCommunicationTrackingCommentsServiceInterface
ApiContainer.bind<ClientCommunicationTrackingCommentsServiceInterface>(
	ApiTypes.clientCommunicationTrackingCommentsService
).to(ClientCommunicationTrackingCommentsService);
//ConfigValuesServiceInterface
ApiContainer.bind<ConfigValuesServiceInterface>(
	ApiTypes.configValuesService
).to(ConfigValuesService);
//ClientCommunicationTrackingInvitationsServiceInterface
ApiContainer.bind<ClientCommunicationTrackingInvitationsServiceInterface>(
	ApiTypes.trackingInvitationsService
).to(ClientCommunicationTrackingInvitationsService);
//ClientNotesServiceInterface
ApiContainer.bind<ClientNotesServiceInterface>(ApiTypes.clientNotesService).to(
	ClientNotesService
);
//ClientDealsServiceInterface
ApiContainer.bind<ClientDealsServiceInterface>(ApiTypes.clientDealsService).to(
	ClientDealsService
);
//ActionsToTake
ApiContainer.bind<ActionsToTakeServiceInterface>(ApiTypes.actionsToTakeService).to(
	ActionsToTakeService
);

export { ApiContainer };
