
const actors = {
  
}

const hosts = {
  
}

const errors = {
  
}

export async function actorStarted(actorStartedEvent: any) {

  actors[actorStartedEvent.id] = actorStartedEvent;

  if (!hosts[actorStartedEvent.ip]) {
    hosts[actorStartedEvent.ip] = {};
  }

  hosts[actorStartedEvent.ip][actorStartedEvent.id] = actorStartedEvent

}

export async function actorStopped(actorStoppedEvent: any) {

  delete actors[actorStoppedEvent.id];
  delete errors[actorStoppedEvent.id];

  if (hosts[actorStoppedEvent.ip]) {

    delete hosts[actorStoppedEvent.ip][actorStoppedEvent.id];

    if (Object.keys(hosts[actorStoppedEvent.ip]).length === 0) {

      delete hosts[actorStoppedEvent.ip];

    }
    
  }

}

export async function actorError(actorErrorEvent: any) {

  errors[actorErrorEvent.id] = actorErrorEvent;

}

export async function listHosts() {

  return Object.keys(hosts).map(ip => {

    return {
      ip,
      actors: Object.values(hosts[ip])
    }
    
  });

}

export async function listActors() {

  return Object.values(actors);

}

