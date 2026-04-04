import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameButton } from '@/src/components/game-button';
import { getClassActionKit } from '@/src/content/class-actions';
import {
  getAuthoredClassCodexCard,
  getAuthoredCompanionCodexCard,
} from '@/src/content/authored-voice';
import { classDefinitions } from '@/src/content/classes';
import { companionDefinitions } from '@/src/content/companions';
import { enemyDefinitions } from '@/src/content/enemies';
import { eventDefinitions } from '@/src/content/events';
import { itemDefinitions } from '@/src/content/items';
import { statusDefinitions } from '@/src/content/statuses';
import {
  buildMetaUpgradeCatalog,
  getDefaultMetaUpgradeLevels,
} from '@/src/engine/meta/meta-upgrade-engine';
import { useGameStore } from '@/src/state/gameStore';
import { useProfileStore } from '@/src/state/profileStore';
import {
  scaleFontSize,
  scaleLineHeight,
  useAppTheme,
} from '@/src/theme/app-theme';
import { spacing } from '@/src/theme/spacing';
import type { ProfileSettingsState, ProfileState } from '@/src/types/profile';

type CodexLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

type CodexCategoryId =
  | 'classes'
  | 'companions'
  | 'items'
  | 'events'
  | 'operations'
  | 'enemies'
  | 'statuses';

type CodexCategoryDefinition = {
  id: CodexCategoryId;
  label: string;
  total: number;
  unlocked: (profile: ProfileState | null) => number;
  description: string;
};

type CodexEntry = {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  tag: string;
  locked: boolean;
  lockHint?: string;
};

const codexCategories: CodexCategoryDefinition[] = [
  {
    id: 'items',
    label: 'Items',
    total: itemDefinitions.length,
    unlocked: (profile) => profile?.unlockedItemIds.length ?? 0,
    description:
      'Track contraband you have recovered and what each item does to the run.',
  },
  {
    id: 'events',
    label: 'Events',
    total: eventDefinitions.length,
    unlocked: (profile) => profile?.unlockedEventIds.length ?? 0,
    description:
      'Review Meridian Spire incidents that have already been encountered in runs.',
  },
  {
    id: 'operations',
    label: 'Upgrades',
    total: 3,
    unlocked: () => 3,
    description:
      'Document the permanent operations programs that change every future dive.',
  },
  {
    id: 'classes',
    label: 'Classes',
    total: classDefinitions.length,
    unlocked: (profile) => profile?.unlockedClassIds.length ?? 0,
    description:
      'See each class fantasy and combat identity, including still-locked roles.',
  },
  {
    id: 'companions',
    label: 'Companions',
    total: companionDefinitions.length,
    unlocked: (profile) => profile?.unlockedCompanionIds.length ?? 0,
    description:
      'Reference current and future companion recruits and their specialties.',
  },
  {
    id: 'enemies',
    label: 'Enemies',
    total: enemyDefinitions.length,
    unlocked: () => enemyDefinitions.length,
    description:
      'Review the enemy roster, their tiers, and the kind of pressure they represent.',
  },
  {
    id: 'statuses',
    label: 'Statuses',
    total: statusDefinitions.length,
    unlocked: () => statusDefinitions.length,
    description:
      'A glossary of recurring combat conditions and cursed Everrise side effects.',
  },
];

export default function CodexScreen() {
  const profile = useProfileStore((state) => state.profile);
  const refreshProfile = useProfileStore((state) => state.refreshProfile);
  const bootstrapProfile = useGameStore((state) => state.profile);
  const bootstrapStatus = useGameStore((state) => state.bootstrapStatus);
  const bootstrapError = useGameStore((state) => state.error);
  const initializeApp = useGameStore((state) => state.initializeApp);
  const refreshBootstrap = useGameStore((state) => state.refreshBootstrap);
  const [loadStatus, setLoadStatus] = useState<CodexLoadStatus>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<CodexCategoryId>('items');
  const resolvedProfile = profile ?? bootstrapProfile;
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  useEffect(() => {
    if (bootstrapStatus === 'idle') {
      void initializeApp();
    }
  }, [bootstrapStatus, initializeApp]);

  useEffect(() => {
    if (bootstrapStatus === 'idle' || bootstrapStatus === 'loading') {
      if (loadStatus !== 'loading') {
        setLoadStatus('loading');
        setLoadError(null);
      }
      return;
    }

    if (bootstrapStatus === 'error') {
      setLoadStatus('error');
      setLoadError(bootstrapError ?? 'The codex profile could not be reconstructed.');
      return;
    }

    if (loadStatus === 'ready' || loadStatus === 'error') {
      return;
    }

    let isCancelled = false;

    setLoadStatus('loading');
    setLoadError(null);

    void (async () => {
      try {
        if (!resolvedProfile) {
          await refreshProfile();
        }

        if (isCancelled) {
          return;
        }

        setLoadStatus('ready');
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setLoadStatus('error');
        setLoadError(
          error instanceof Error && error.message
            ? error.message
            : 'The codex profile could not be refreshed.'
        );
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [
    bootstrapError,
    bootstrapStatus,
    loadStatus,
    refreshProfile,
    resolvedProfile,
  ]);

  const handleRefresh = async () => {
    setLoadStatus('loading');
    setLoadError(null);

    try {
      await refreshBootstrap();
      await refreshProfile();
      setLoadStatus('ready');
    } catch (error) {
      setLoadStatus('error');
      setLoadError(
        error instanceof Error && error.message
          ? error.message
          : 'The codex profile could not be refreshed.'
      );
    }
  };

  const selectedCategory = useMemo(
    () =>
      codexCategories.find((category) => category.id === selectedCategoryId) ??
      codexCategories[0],
    [selectedCategoryId]
  );
  const codexEntries = useMemo(
    () => buildCodexEntries(selectedCategory.id, resolvedProfile),
    [resolvedProfile, selectedCategory.id]
  );
  const visibleCategories = useMemo(
    () =>
      codexCategories.map((category) => ({
        ...category,
        unlockedCount: category.unlocked(resolvedProfile),
      })),
    [resolvedProfile]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.shell}>
          <View style={styles.heroCard}>
            <Text style={styles.eyebrow}>REFERENCE</Text>
            <Text style={styles.title}>Codex</Text>
            <Text style={styles.subtitle}>
              The tower keeps records, even when it should burn them.
            </Text>
            <Text style={styles.body}>
              Browse the current class, companion, item, event, enemy, and
              status catalogs. Profile-based categories stay classified until
              the relevant content is actually unlocked.
            </Text>
          </View>

          {loadStatus === 'idle' || loadStatus === 'loading' ? (
            <LoadingPanel label="Rebuilding the Meridian incident archive..." />
          ) : loadStatus === 'error' ? (
            <InfoPanel
              title="Codex Error"
              body={loadError ?? 'The codex could not be reconstructed.'}
              primaryLabel="Try Again"
              onPrimaryPress={handleRefresh}
              secondaryLabel="Return to Title"
              onSecondaryPress={() => {
                router.push('/' as Href);
              }}
            />
          ) : (
            <>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Coverage</Text>
                <Text style={styles.panelBody}>
                  Browse the known classes, loot, events, enemies, and status
                  effects tied to your current profile.
                </Text>
                <View style={styles.statGrid}>
                  <StatCard
                    label="Classes"
                    value={formatCoverage(
                      resolvedProfile?.unlockedClassIds.length ?? 0,
                      classDefinitions.length
                    )}
                  />
                  <StatCard
                    label="Companions"
                    value={formatCoverage(
                      resolvedProfile?.unlockedCompanionIds.length ?? 0,
                      companionDefinitions.length
                    )}
                  />
                </View>
                <View style={styles.statGrid}>
                  <StatCard
                    label="Items"
                    value={formatCoverage(
                      resolvedProfile?.unlockedItemIds.length ?? 0,
                      itemDefinitions.length
                    )}
                  />
                  <StatCard
                    label="Events"
                    value={formatCoverage(
                      resolvedProfile?.unlockedEventIds.length ?? 0,
                      eventDefinitions.length
                    )}
                  />
                </View>
                <View style={styles.detailCard}>
                  <DetailLine
                    label="Enemies"
                    value={`${enemyDefinitions.length} documented`}
                  />
                  <DetailLine
                    label="Statuses"
                    value={`${statusDefinitions.length} documented`}
                  />
                  <DetailLine
                    label="Selected Shelf"
                    value={selectedCategory.label}
                  />
                  <DetailLine
                    label="Operations"
                    value="3 programs documented"
                  />
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Shelves</Text>
                <Text style={styles.panelBody}>
                  Pick a category to browse. Unlock-driven shelves keep unknown
                  entries visible but classified, so progression still feels
                  discoverable.
                </Text>
                <View style={styles.categoryList}>
                  {visibleCategories.map((category) => {
                    const isSelected = category.id === selectedCategory.id;

                    return (
                      <Pressable
                        key={category.id}
                        style={[
                          styles.categoryCard,
                          isSelected ? styles.categoryCardSelected : null,
                        ]}
                        onPress={() => {
                          setSelectedCategoryId(category.id);
                        }}
                      >
                        <View style={styles.categoryHeader}>
                          <Text style={styles.categoryTitle}>{category.label}</Text>
                          <Text style={styles.categoryCount}>
                            {category.unlockedCount}/{category.total}
                          </Text>
                        </View>
                        <Text style={styles.categoryBody}>
                          {category.description}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>{selectedCategory.label}</Text>
                <Text style={styles.panelBody}>{selectedCategory.description}</Text>
                <View style={styles.entryList}>
                  {codexEntries.map((entry) => (
                    <View
                      key={`${selectedCategory.id}-${entry.id}`}
                      style={[
                        styles.entryCard,
                        entry.locked ? styles.entryCardLocked : null,
                      ]}
                    >
                      <View style={styles.entryHeader}>
                        <View style={styles.entryHeading}>
                          <Text style={styles.entryTitle}>{entry.title}</Text>
                          <Text style={styles.entrySubtitle}>{entry.subtitle}</Text>
                        </View>
                        <View
                          style={[
                            styles.entryBadge,
                            entry.locked
                              ? styles.entryBadgeLocked
                              : styles.entryBadgeLive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.entryBadgeText,
                              entry.locked
                                ? styles.entryBadgeTextLocked
                                : styles.entryBadgeTextLive,
                            ]}
                          >
                            {entry.tag}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.entryBody}>
                        {entry.locked ? entry.lockHint ?? entry.body : entry.body}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Actions</Text>
                <View style={styles.actionGroup}>
                  <GameButton
                    label="Refresh Codex"
                    onPress={() => {
                      void handleRefresh();
                    }}
                  />
                  <GameButton
                    label="Return to Title"
                    onPress={() => {
                      router.push('/' as Href);
                    }}
                    variant="secondary"
                  />
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function buildCodexEntries(
  categoryId: CodexCategoryId,
  profile: ProfileState | null
): CodexEntry[] {
  if (categoryId === 'classes') {
    return classDefinitions.map((item) => {
      const locked = !profile?.unlockedClassIds.includes(item.id);
      const authoredCard = getAuthoredClassCodexCard(item.id);
      const actionSummary = getClassActionKit(item.id).actions
        .map((action) => `${action.label}: ${action.summary}`)
        .join('\n');
      const bodyParts = [
        authoredCard?.codexBody ?? item.description,
        authoredCard?.firstSeenLine ? `First Seen\n${authoredCard.firstSeenLine}` : null,
        authoredCard?.optionalUnlockFlavor
          ? `Archive Note\n${authoredCard.optionalUnlockFlavor}`
          : null,
        authoredCard?.expandedEntry ?? null,
        `Action Kit\n${actionSummary}`,
      ].filter(Boolean);

      return {
        id: item.id,
        title: item.name,
        subtitle: item.combatIdentity,
        body: bodyParts.join('\n\n'),
        tag: locked ? 'Classified' : 'Unlocked',
        locked,
        lockHint: 'This class has not been unlocked on the current profile yet.',
      };
    });
  }

  if (categoryId === 'companions') {
    return companionDefinitions.map((item) => {
      const locked = !profile?.unlockedCompanionIds.includes(item.id);
      const authoredCard = getAuthoredCompanionCodexCard(item.id);
      const bodyParts = [
        authoredCard?.codexBody ?? item.description,
        authoredCard?.firstSeenLine ? `First Seen\n${authoredCard.firstSeenLine}` : null,
        authoredCard?.optionalUnlockFlavor
          ? `Archive Note\n${authoredCard.optionalUnlockFlavor}`
          : null,
        authoredCard?.expandedEntry ?? null,
      ].filter(Boolean);

      return {
        id: item.id,
        title: item.name,
        subtitle: item.specialty,
        body: bodyParts.join('\n\n'),
        tag: locked ? 'Classified' : 'Unlocked',
        locked,
        lockHint:
          'This companion has not joined the active roster on the current profile yet.',
      };
    });
  }

  if (categoryId === 'items') {
    return itemDefinitions.map((item) => {
      const locked = !profile?.unlockedItemIds.includes(item.id);

      return {
        id: item.id,
        title: item.name,
        subtitle: `${capitalize(item.rarity)} contraband`,
        body: item.effectSummary,
        tag: locked ? 'Unknown' : item.rarity,
        locked,
        lockHint:
          'Recover this item during a run to reveal its permanent codex entry.',
      };
    });
  }

  if (categoryId === 'events') {
    return eventDefinitions.map((item) => {
      const locked = !profile?.unlockedEventIds.includes(item.id);

      return {
        id: item.id,
        title: item.title,
        subtitle: locked ? 'Classified incident' : 'Archived incident',
        body: item.description,
        tag: locked ? 'Unknown' : 'Seen',
        locked,
        lockHint:
          'Encounter this office disaster in a live run to archive the details here.',
      };
    });
  }

  if (categoryId === 'operations') {
    const offers = buildMetaUpgradeCatalog({
      metaCurrency: profile?.metaCurrency ?? 0,
      metaUpgradeLevels: profile?.metaUpgradeLevels ?? getDefaultMetaUpgradeLevels(),
    });

    return offers.map((offer) => ({
      id: offer.id,
      title: offer.title,
      subtitle: offer.subtitle,
      body: `${offer.description}\n\n${offer.currentEffectLabel}${
        offer.nextEffectLabel ? `\n${offer.nextEffectLabel}` : '\nFully upgraded.'
      }`,
      tag: `Rank ${offer.currentLevel}/${offer.maxLevel}`,
      locked: false,
    }));
  }

  if (categoryId === 'enemies') {
    return enemyDefinitions.map((item) => ({
      id: item.id,
      title: item.name,
      subtitle: `${capitalize(item.tier)} enemy`,
      body: `${item.intent} Base health ${item.baseHealth}.`,
      tag: item.tier,
      locked: false,
    }));
  }

  return statusDefinitions.map((item) => ({
    id: item.id,
    title: item.name,
    subtitle: `${capitalize(item.polarity)} status`,
    body: item.effectSummary,
    tag: item.polarity,
    locked: false,
  }));
}

function formatCoverage(unlocked: number, total: number) {
  return `${unlocked}/${total}`;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function LoadingPanel({ label }: { label: string }) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <View style={styles.panel}>
      <View style={styles.loadingState}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={styles.panelBody}>{label}</Text>
      </View>
    </View>
  );
}

function InfoPanel({
  title,
  body,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
}: {
  title: string;
  body: string;
  primaryLabel: string;
  onPrimaryPress: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
}) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{title}</Text>
      <Text style={styles.panelBody}>{body}</Text>
      <View style={styles.actionGroup}>
        <GameButton label={primaryLabel} onPress={onPrimaryPress} />
        {secondaryLabel && onSecondaryPress ? (
          <GameButton
            label={secondaryLabel}
            onPress={onSecondaryPress}
            variant="secondary"
          />
        ) : null}
      </View>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <Text style={styles.detailLine}>
      <Text style={styles.detailLabel}>{label}: </Text>
      {value}
    </Text>
  );
}

function createStyles(
  settings: ProfileSettingsState,
  colors: ReturnType<typeof useAppTheme>['colors']
) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  shell: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: spacing.xl,
    gap: spacing.sm + 2,
  },
  eyebrow: {
    color: colors.textSubtle,
    fontSize: scaleFontSize(12, settings),
    fontWeight: '800',
    letterSpacing: 1 + (settings.dyslexiaAssistEnabled ? 0.18 : 0),
  },
  title: {
    color: colors.textPrimary,
    fontSize: scaleFontSize(34, settings),
    fontWeight: '900',
    lineHeight: scaleLineHeight(38, settings),
  },
  subtitle: {
    color: colors.accent,
    fontSize: scaleFontSize(16, settings),
    fontWeight: '800',
    lineHeight: scaleLineHeight(22, settings),
  },
  body: {
    color: colors.textMuted,
    fontSize: scaleFontSize(15, settings),
    lineHeight: scaleLineHeight(22, settings),
    letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
  },
  panel: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 18,
    padding: spacing.lg,
    gap: spacing.md,
  },
  panelTitle: {
    color: colors.textPrimary,
    fontSize: scaleFontSize(17, settings),
    fontWeight: '800',
    lineHeight: scaleLineHeight(21, settings),
  },
  panelBody: {
    color: colors.textMuted,
    fontSize: scaleFontSize(14, settings),
    lineHeight: scaleLineHeight(21, settings),
    letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
  },
  loadingState: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  statGrid: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  statValue: {
    color: colors.accent,
    fontSize: scaleFontSize(22, settings),
    fontWeight: '900',
    lineHeight: scaleLineHeight(26, settings),
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: scaleFontSize(12, settings),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
  },
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs + 2,
  },
  detailLine: {
    color: colors.textSecondary,
    fontSize: scaleFontSize(14, settings),
    lineHeight: scaleLineHeight(20, settings),
  },
  detailLabel: {
    color: colors.textSubtle,
    fontWeight: '700',
  },
  categoryList: {
    gap: spacing.sm + 2,
  },
  categoryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs + 2,
  },
  categoryCardSelected: {
    borderColor: colors.accent,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryTitle: {
    color: colors.textPrimary,
    fontSize: scaleFontSize(16, settings),
    fontWeight: '800',
    lineHeight: scaleLineHeight(20, settings),
  },
  categoryCount: {
    color: colors.accent,
    fontSize: scaleFontSize(13, settings),
    fontWeight: '800',
    lineHeight: scaleLineHeight(18, settings),
  },
  categoryBody: {
    color: colors.textMuted,
    fontSize: scaleFontSize(13, settings),
    lineHeight: scaleLineHeight(19, settings),
    letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
  },
  entryList: {
    gap: spacing.sm + 2,
  },
  entryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  entryCardLocked: {
    opacity: 0.78,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  entryHeading: {
    flex: 1,
    gap: spacing.xs,
  },
  entryTitle: {
    color: colors.textPrimary,
    fontSize: scaleFontSize(17, settings),
    fontWeight: '800',
    lineHeight: scaleLineHeight(21, settings),
  },
  entrySubtitle: {
    color: colors.textSecondary,
    fontSize: scaleFontSize(13, settings),
    lineHeight: scaleLineHeight(19, settings),
  },
  entryBody: {
    color: colors.textMuted,
    fontSize: scaleFontSize(13, settings),
    lineHeight: scaleLineHeight(19, settings),
    letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
  },
  entryBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  entryBadgeLive: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.accent,
  },
  entryBadgeLocked: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.borderStrong,
  },
  entryBadgeText: {
    fontSize: scaleFontSize(11, settings),
    fontWeight: '800',
    letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    textTransform: 'uppercase',
  },
  entryBadgeTextLive: {
    color: colors.accent,
  },
  entryBadgeTextLocked: {
    color: colors.textMuted,
  },
  actionGroup: {
    gap: spacing.sm + 2,
  },
  });
}
