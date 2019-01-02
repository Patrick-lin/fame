import gql from 'graphql-tag';

const quest = `
  _id
  title
  type
  rank
  moneyReward
  fameReward
  expReward
`;

const hero = `
  _id
  name
  state
  type
  rank
  growth
  level
  price
  exp
  nextLevelExp
  nextLevelPercent
  stat {
    agi
    str
    int
  }
  stateEndAt
  stateDuration
  questId
`;

export const JOIN = gql`
  mutation joinGame($input: Join) {
    joinGame(input: $input) {
      success
      message
      player {
        _id
        name
        room
      }
    }
  }
`;

const game = `
  name
  rank
  players {
    _id
    name
    money
    fame
    heroes
  }

  advertiser {
    isUnlocked
    ads {
      _id
      title
      price
      fame
    }
  }

  blacksmith {
    isUnlocked
    refreshDuration
    nextRefreshAt
    weapons {
      _id
      name
      rank
      price
      stat {
        str
        agi
        int
      }
    }
  }

  academy {
    isUnlocked
    refreshDuration
    nextRefreshAt
    heroes { ${hero} }
  }

  villagers
  questRefreshDuration
  nextQuestRefresh

  availableQuests { ${quest} }
  ongoingQuests { ${quest} }

  heroes { ${hero} }
`;

export const LOAD_GAME = gql`
  mutation loadGame {
    game { ${game} }
  }
`;

export const GAME_HEARTBEAT = gql`
  mutation {
    gameHeartbeat
  }
`;

export const TAKE_QUEST = gql`
  mutation TakeQuest($input: TakeQuest!) {
    takeQuest(input: $input)
  }
`;

export const RECRUIT = gql`
  mutation Recruit($input: Recruit!) {
    recruit(input: $input)
  }
`;

export const SUB_GAME = gql`
  subscription {
    game { ${game} }
  }
`;

export const SUB_AVAILABLE_QUESTS = gql`
  subscription Root {
    availableQuests { ${quest} }
  }
`;

export const SUB_HEROES = gql`
  subscription Root {
    heroes { ${hero} }
  }
`;

export const SUB_NOTIF = gql`
  subscription {
    notif {
      title
      message
      type
    }
  }
`;

export const PAY_AD = gql`
  mutation PayAd($input: PayAd!) {
    payAd(input: $input)
  }
`;