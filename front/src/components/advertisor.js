import React from 'react';
import { connect } from 'react-redux';
import { compose, fromRenderProps, withHandlers } from 'recompose';
import { selectAdvertisor } from '../redux/selectors';
import { get, map } from 'lodash';
import { Mutation } from 'react-apollo';
import { Header } from 'semantic-ui-react';
import { PAY_AD } from '../apollo/query';

const Advertisor = ({ advertisor, payAd }) => {
  if (!advertisor || !advertisor.isUnlocked) {
    return <div>Advertisor is not available</div>
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <Header>Advertising agency</Header>
      <div className="dv-list">
        {map(get(advertisor, 'ads'), ad => (
        <div className="dv-card" key={ad._id} onClick={() => payAd(ad)}>
            <div className="dv-title">{ad.title}</div>
            <div className="dv-price">Cost <span className="gold-text">{ad.price} Gold</span></div>
            <div className="fame-text dv-fame">+ {ad.fame} Fame</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default compose(
  fromRenderProps(
    ({ children }) => <Mutation mutation={PAY_AD} children={children} />,
    payAd => ({ payAd }),
  ),
  withHandlers({
    payAd: ({ payAd }) => ad => payAd({ variables: { input: { adId: ad._id } }  }),
  }),
  connect(state => ({
    advertisor: selectAdvertisor(state),
  })),
)(Advertisor);