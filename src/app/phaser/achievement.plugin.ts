import * as Phaser from 'phaser';
import { Plugins } from '@capacitor/core';
import '@openforge/capacitor-game-services';
import { GameServicesPlugin } from '@openforge/capacitor-game-services';
const GameServices = Plugins.GameServices as GameServicesPlugin;

type ScoreAchievementState = {
  locked: boolean;
  achievementId: string;
  score: number;
};

export const gameServicesConstants: {
  defaultLeaderboard: { leaderboardId: string },
  scoreAchievements: Pick<ScoreAchievementState, 'achievementId' | 'score'>[];
} = {
  scoreAchievements: [
    {
      achievementId: 'CgkIzPzc8d4XEAIQCQ',
      score: 1_000,
    },
    {
      achievementId: 'CgkIzPzc8d4XEAIQAw',
      score: 2_000,
    },
    {
      achievementId: 'CgkIzPzc8d4XEAIQBA',
      score: 4_000,
    },
    {
      achievementId: 'CgkIzPzc8d4XEAIQBQ',
      score: 6_000,
    },
    {
      achievementId: 'CgkIzPzc8d4XEAIQBg',
      score: 8_000,
    },
    {
      achievementId: 'CgkIzPzc8d4XEAIQBw',
      score: 10_000,
    },
    {
      achievementId: 'CgkIzPzc8d4XEAIQCA',
      score: 20_000,
    }
  ],

  defaultLeaderboard: {
    leaderboardId: 'CgkIzPzc8d4XEAIQAQ'
  },


};

export class AchievementsPlugin extends Phaser.Plugins.BasePlugin {
  private scoreAchievementsState = gameServicesConstants.scoreAchievements
    .map(achievementData => ({ ...achievementData, locked: true }));

  public checkScoreAchievementsState(scoreToCheck: number) {
    this.scoreAchievementsState
      .filter(allowLockedAndReachedScores(scoreToCheck))
      .forEach(unlockScoreAchievement());
  }

  constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager);
  }
}

export const AchievementsGlobalPlugin: Phaser.Types.Plugins.GlobalPlugin = {
  key: AchievementsPlugin.name,
  plugin: AchievementsPlugin,
  active: true,
  mapping: 'achievements',
} as const;

const allowLockedAndReachedScores =
  (scoreToCheck: number) =>
    (scoreAchievement: ScoreAchievementState) =>
      scoreAchievement.score <= scoreToCheck
      && scoreAchievement.locked;

const unlockScoreAchievement =
  () =>
    (scoreAchievement: ScoreAchievementState) => {
      const { achievementId } = scoreAchievement;
      GameServices.unlockAchievement({ achievementId });
      scoreAchievement.locked = false;
    };
