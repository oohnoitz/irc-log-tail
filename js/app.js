/**
 * EventLog Component
 */
class EventLog extends React.Component {
  render() {
    let eventItem = function(event) {
      return (
        <EventItem key={event.id} event={event} />
      );
    }

    return (
      <div className="event-log">
        {this.props.events.map(eventItem)}
      </div>
    );
  }
}

/**
 * EventItem Component
 */
class EventItem extends React.Component {
  processEvent() {
    let event = this.props.event;

    switch (event.type) {
      case 'message':
        return `<${event.nick}> ${event.text}`;
      case 'mode':
        return (event.nick === '') ? `ChanServ sets mode: ${event.text}` : `${event.nick} sets mode: ${event.text}`;
      case 'join':
      case 'rejoin':
        return `* Joins: ${event.nick}`;
      case 'part':
        return `* Parts: ${event.nick} ${(event.text ? `(${event.text})` : '')}`;
      case 'quit':
      case 'split':
        return `* Quits: ${event.nick} ${(event.text ? `(${event.text})` : '')}`;
      case 'nick':
        return `* ${event.nick} is now known as ${event.text}`;
      case 'ctcp':
        let args = event.text.split(' ');
        if (args[0] === 'ACTION:') {
          args.shift();
          return `* ${event.nick} ${args.join(' ')}`;
        }
        break;
      case 'kick':
        let args = event.text.split(' ');
        var user = args[0];
        if (args[1] === '') {
          return `${user} was kicked by ${event.nick}`;
        } else {
          return `${user} was kicked by ${event.nick} (${args.splice(1, 1).join(' ')})`;
        }
        break;
      case 'topic':
        if (event.nick !== '*') {
          return `${event.nick} changes topic to '${event.text}'`;
        }
        break;
    }
  }

  render() {
    let eventType = this.props.event.type;
    let className = `event-message event-type-${eventType}`;

    return (
      <div className="event-item">
        <span className="event-timestamp">
          {moment(this.props.event.unixtime).format('HH:mm:ss')}
        </span>
        <span className={className}>
          {this.processEvent()}
        </span>
      </div>
    );
  }
}

/**
 * UserList Component
 */
class UserList extends React.Component {
  render() {
    let userListItem = function(user) {
      return (
        <UserListItem user={user} />
      );
    };

    return (
      <div className="user-list-container">
        <div className="user-list">
          {this.props.users.map(userListItem)}
        </div>
      </div>
    );
  }
}

/**
 * UserListItem
 */
class UserListItem extends React.Component {
  render() {
    return (
      <div className="user-list-item">
        {this.props.user}
      </div>
    );
  }
}

/**
 * Main Component
 */
class App extends React.Component {
  constructor() {
    super();

    this.state = {
      poll: false,
      channel: null,
      latestEvent: 0,
      events: [],
      users: [],
      topic: ''
    };
  }

  getChannelLog() {
    $.ajax({
      url: `api`,
      dataType: 'json',
      data: {
        channel: this.state.channel !== null ? this.state.channel.slice(1) : this.props.defaultChannel,
        request: this.state.poll && this.state.latestEvent > 0 ? 'log-stream' : 'log',
        lastLog: this.state.latestEvent
      },
      success: function(data) {
        this.setState({
          poll: true,
          channel: data.channel,
          topic: data.topic,
          users: data.users,
          events: this.state.events.concat(data.events)
        });

        let latestEvent = data.events.slice(-1).pop();
        if (latestEvent) {
          this.setState({
            latestEvent: latestEvent.id
          });
        }

      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
  }

  handleChannel() {
    this.setState({
      poll: false,
      channel: prompt('Enter IRC Channel:'),
      latestEvent: 0,
      events: [],
      users: [],
      topic: ''
    }, function() {
      this.getChannelLog();
    }.bind(this));
  }

  componentDidMount() {
    this.getChannelLog();
    setInterval(this.getChannelLog.bind(this), this.props.pollInterval);
  }

  render() {
    return (
      <div className="container">
        <h1 onClick={this.handleChannel.bind(this)}>{this.state.channel}</h1>
        <div className="topic">{this.state.topic}</div>

        <div className="main">
          <div className="event-log-container">
            <EventLog events={this.state.events} />
          </div>

          <UserList users={this.state.users} />
        </div>
      </div>
    );
  }
}

React.render(<App defaultChannel="developers" pollInterval={5000} />, document.getElementById('app'));
