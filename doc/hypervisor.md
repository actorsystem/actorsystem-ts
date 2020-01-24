
# System Supervisor

Each actor system lives in many processes across any number of host machines.
Yet they all connect to the same message exchange virtual host in order to
communicate as a whole.

## Dashboard

We monitor all of the actors in our system by viewing them in a dashboard
powered by a JSON API. Each actor reports to the Hypervisor (system supervisor)
by publishing messages about its internal configuration. The Hypervisor collects
reports from all actors on all hosts and indexes them for your viewing pleasure.

### How Hypervisor Works

Each actor publishes a messages to the `rabbi.hypervisor` exchange. The
Hypervisor listens to the following message types as routing keys:

- actor.started
- actor.stopped
- actor.error

#### actor.started

- exchange
- routingkey
- queue
- publickey
- environment
- host
- connection
- channel

#### actor.stopped

- publickey

#### actor.error

- publickey
- error

