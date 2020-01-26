
import * as moment from 'moment';

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

  hosts[actorStartedEvent.ip][actorStartedEvent.id] = Object.assign(
    actorStartedEvent, {
      last_heartbeat_at: new Date()
    }
  );

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

export async function actorHeartbeat(actorHeartbeatEvent: any) {

  let actor = hosts[actorHeartbeatEvent.ip][actorHeartbeatEvent.id];

  let newActorValue = Object.assign(actor, {

    last_heartbeat_at: new Date()

  });

  hosts[actorHeartbeatEvent.ip][actorHeartbeatEvent.id] = newActorValue;

  actors[actorHeartbeatEvent.id] = newActorValue;

}

export async function listHosts() {

  return Object.keys(hosts).map(ip => {

    return {
      ip,
      actors: Object.values(hosts[ip])
    }
    
  });

}

setInterval(async () => {

  let one_minute_ago = moment().subtract(1, 'minutes').unix();

  let _actors = await listActors();

  _actors.forEach((actor: any) => {

    let lastHeartbeat = moment(actor.last_heartbeat_at).unix();

    if (one_minute_ago > lastHeartbeat) {

        console.log('delete stale actor', {
          actor_id: actor.id
        });

      delete actors[actor.id];
    }

  });

  let _hosts = Object.values(hosts);

  Object.values(hosts).forEach((host: any) => {

    Object.values(host).forEach((actor: any) => {

      let lastHeartbeat = moment(actor.last_heartbeat_at).unix();

      if (one_minute_ago > lastHeartbeat) {

        console.log('delete stale actor from host', {
          host_ip: actor.host_ip,
          actor_id: actor.id
        });

        console.log(`hosts[${actor.ip}][${actor.id}]`);

        delete hosts[actor.ip][actor.id];

      }

    });

  });

}, 15000);

export async function listActors() {

  return Object.values(actors);

}

