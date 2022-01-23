import { ClientBase, ClientOptions } from "./ClientBase";
import { initAPIs, APIs } from "./apis";
import { RESTController } from "../controllers/rest";
import * as ClientSocket from "./lib/ClientSocket/ClientSocket";
import { ChatManager } from "./lib/ChatManager/ChatManager";
import { DataStoreManager } from "./lib/DataStoreManager/DataStoreManager";
import { User } from "../structures";
import { UserManager } from "./managers/UserManager";
import { GroupManager } from "./managers/GroupManager";

export class Client extends ClientBase {
  public user: User | null;
  public apis: APIs;
  public rest: RESTController;
  public socket: ClientSocket.Socket;
  public dataStoreManager: DataStoreManager;
  public chat: ChatManager;

  public users: UserManager;
  public groups: GroupManager;

  constructor(options?: ClientOptions) {
    super(options);

    this.user = null;
    this.apis = initAPIs(this);
    this.rest = new RESTController(this, this.options.rest);
    this.socket = new ClientSocket.Socket(this);
    this.dataStoreManager = new DataStoreManager(this);
    this.chat = new ChatManager(this);

    this.users = new UserManager(this);
    this.groups = new GroupManager(this);

    this.init();
  }

  public isLoggedIn(): boolean {
    return this.user !== null;
  }

  private init(): void {
    if (this.options.rest) {
      this.rest.setOptions(this.options.rest);
    }
  }

  public async login(cookie?: string): Promise<User> {
    this.log("info", {
      name: "Client.login",
      description: `Started login process..`
    });
    cookie = cookie || (this.options.credentials || {}).cookie || undefined;

    if (!cookie) {
      throw new Error("Attempted to log in without a cookie!");
    }
    this.options.credentials = {
      ...this.options.credentials,
      cookie
    };

    const createdCookie = this.rest.createCookie({
      key: ".ROBLOSECURITY",
      value: cookie,
      domain: "roblox.com",
      hostOnly: false,
      httpOnly: false
    });

    this.rest.addCookie(createdCookie);

    this.log("info", {
      name: "Client.login",
      description: `Added cookie to cookie jar, proceeding to fetching authenticated user information..`
    });

    const getAuthenticationData =
      await this.apis.usersAPI.getAuthenticatedUserInformation();
    const userData = await this.apis.usersAPI.getUserById({
      userId: getAuthenticationData.id
    });
    this.user = new User(this, userData);
    this.emit("loggedIn");

    this.log("info", {
      name: "Client.login",
      description: `Successfully logged in as ${getAuthenticationData.name}`
    });

    return this.user;
  }
}
