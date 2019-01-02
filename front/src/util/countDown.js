import React from 'react';
import { compose, withState, lifecycle } from 'recompose';
import { Progress } from 'semantic-ui-react';

const CountDown = ({ count, render }) => render(count);
CountDown.defaultProps = {
  render: ({ percent }) => (
    <Progress color="red" size="tiny" percent={percent} />
  )
};


const update = (date, duration) => {
  const count = Math.max(0, date - Date.now());
  return {
    percent: (1 - (count / duration)) * 100,
    count,
  };
}
export default compose(
  withState('count', 'setCount', ({ date, duration }) => update(date, duration)),
  lifecycle({
    componentDidMount() {
      this.timer = setInterval(() => {
        const { date, duration } = this.props;
        this.props.setCount(update(date, duration));
      }, 100);
    },
    componentWillUnmount() {
      clearInterval(this.timer);
    }
  }),
)(CountDown);