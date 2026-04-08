import { getCompanionDefinition } from '@/src/content/companions';
import type { CombatActionId, CombatEnemyState } from '@/src/types/combat';

type CombatBanterRole = 'active' | 'reserve';
type BondNarrativeTier = 'low' | 'trusted' | 'devoted';

type CombatCompanionInput = {
  activeCompanionId: string;
  reserveCompanionId: string;
  companionBondLevels: Record<string, number>;
};

type CombatActionBanterContext = {
  enemy: CombatEnemyState;
  actionId: CombatActionId;
  heroHp: number;
  heroMaxHp: number;
  enemyCurrentHp: number;
  enemyMaxHp: number;
};

function clampBondLevel(level: number) {
  return Math.max(1, Math.floor(Number.isFinite(level) ? level : 1));
}

function getBondNarrativeTier(bondLevel: number): BondNarrativeTier {
  if (bondLevel >= 5) {
    return 'devoted';
  }

  if (bondLevel >= 3) {
    return 'trusted';
  }

  return 'low';
}

function formatCombatCommsLine(
  role: CombatBanterRole,
  companionName: string,
  line: string
) {
  return `${role === 'active' ? 'Lead Comms' : 'Reserve Comms'} - ${companionName}: ${line}`;
}

function getEnemyPressureLabel(enemyCurrentHp: number, enemyMaxHp: number) {
  if (enemyCurrentHp * 2 <= enemyMaxHp) {
    return 'shaking';
  }

  return 'still planted';
}

function getHeroConditionLabel(heroHp: number, heroMaxHp: number) {
  if (heroHp * 2 <= heroMaxHp) {
    return 'running ragged';
  }

  return 'still steady';
}

function getFormerExecutiveAssistantIntroLine(
  role: CombatBanterRole,
  tier: BondNarrativeTier,
  enemyName: string
) {
  if (role === 'active') {
    if (tier === 'devoted') {
      return `${enemyName} is telegraphing every bad decision. Stay with my read and it never gets a clean turn.`;
    }

    if (tier === 'trusted') {
      return `I know this kind of room. Break ${enemyName} before it decides it owns the pace.`;
    }

    return `${enemyName} has executive rhythm. Hit first and keep it reacting.`;
  }

  if (tier === 'devoted') {
    return `If ${enemyName} steals the pace, swap me in. I will cut its calendar apart for you.`;
  }

  if (tier === 'trusted') {
    return `Tag me if ${enemyName} starts dictating the room. I can wreck its timing.`;
  }

  return `If this turns into a meeting, pull me in. ${enemyName} looks the type.`;
}

function getFormerExecutiveAssistantActionLine(
  role: CombatBanterRole,
  tier: BondNarrativeTier,
  context: CombatActionBanterContext
) {
  if (context.actionId === 'patch') {
    if (tier === 'devoted') {
      return `${context.enemy.name} is ${getEnemyPressureLabel(
        context.enemyCurrentHp,
        context.enemyMaxHp
      )}. Keep following my cadence and it folds.`;
    }

    if (tier === 'trusted') {
      return `Good. Keep ${context.enemy.name} answering us instead of setting terms.`;
    }

    return `Clean hit. Keep ${context.enemy.name} off script.`;
  }

  if (context.actionId === 'escalate') {
    if (role === 'reserve' && tier === 'devoted') {
      return `Perfect. I can cover the fallout from here. Make ${context.enemy.name} panic.`;
    }

    if (tier === 'trusted') {
      return `Force the pace. ${context.enemy.name} hates improvisation.`;
    }

    return `Loud works. Make ${context.enemy.name} answer it.`;
  }

  if (context.actionId === 'dodge') {
    if (tier === 'devoted') {
      return `Good. Make ${context.enemy.name} miss the room and it loses the whole exchange.`;
    }

    if (tier === 'trusted') {
      return `Perfect. Steal the timing, then punish the opening.`;
    }

    return `Nice slip. Keep ${context.enemy.name} guessing.`;
  }

  if (tier === 'devoted') {
    return `Breathe. You're ${getHeroConditionLabel(
      context.heroHp,
      context.heroMaxHp
    )}, and I am still reading every angle for you.`;
  }

  if (tier === 'trusted') {
    return `Reset now. I can buy us the next clean opening.`;
  }

  return `Take the breath. ${context.enemy.name} wants panic more than pressure.`;
}

function getFacilitiesGoblinIntroLine(
  role: CombatBanterRole,
  tier: BondNarrativeTier,
  enemyName: string
) {
  if (role === 'active') {
    if (tier === 'devoted') {
      return `${enemyName} is load-bearing nonsense. Stay close and I will show you exactly where it breaks.`;
    }

    if (tier === 'trusted') {
      return `I can route us through ${enemyName}. Just hit where the structure complains.`;
    }

    return `${enemyName} is a maintenance hazard. Keep moving before it settles in.`;
  }

  if (tier === 'devoted') {
    return `Swap me in if ${enemyName} gets weird. I already know which panel to kick for you.`;
  }

  if (tier === 'trusted') {
    return `Tag me if the floor plan goes bad. I brought tools and worse ideas.`;
  }

  return `If this turns structural, I can take the next shift.`;
}

function getFacilitiesGoblinActionLine(
  role: CombatBanterRole,
  tier: BondNarrativeTier,
  context: CombatActionBanterContext
) {
  if (context.actionId === 'patch') {
    if (tier === 'devoted') {
      return `There. ${context.enemy.name} is already ${getEnemyPressureLabel(
        context.enemyCurrentHp,
        context.enemyMaxHp
      )}. Keep kicking the weak seam.`;
    }

    if (tier === 'trusted') {
      return `Nice. One more clean hit and ${context.enemy.name} loses the frame.`;
    }

    return `Good strike. ${context.enemy.name} hates a simple repair.`;
  }

  if (context.actionId === 'escalate') {
    if (role === 'reserve' && tier === 'devoted') {
      return `Louder. I can brace the splashback while ${context.enemy.name} comes apart.`;
    }

    if (tier === 'trusted') {
      return `Messy, but useful. ${context.enemy.name} is easier to fix after a hard jolt.`;
    }

    return `That shook the wiring. Keep leaning on it.`;
  }

  if (context.actionId === 'dodge') {
    if (tier === 'devoted') {
      return `There it is. Let ${context.enemy.name} hit empty air and the whole frame starts wobbling.`;
    }

    if (tier === 'trusted') {
      return `Good slip. The structure hates a missed load.`;
    }

    return `Clean dodge. That made the room worse for it.`;
  }

  if (tier === 'devoted') {
    return `Take the breather. You're ${getHeroConditionLabel(
      context.heroHp,
      context.heroMaxHp
    )}, and I can hold the ugly part together.`;
  }

  if (tier === 'trusted') {
    return `Reset fast. I can keep the collapse off you for a beat.`;
  }

  return `Catch your breath. I can buy us a second if needed.`;
}

function getSecuritySkeletonIntroLine(
  role: CombatBanterRole,
  tier: BondNarrativeTier,
  enemyName: string
) {
  if (role === 'active') {
    if (tier === 'devoted') {
      return `${enemyName} is now my problem first. Remain behind my line and continue the assault.`;
    }

    if (tier === 'trusted') {
      return `Understood. ${enemyName} has been reclassified as an active security incident.`;
    }

    return `${enemyName} violates several policies. We may proceed with prejudice.`;
  }

  if (tier === 'devoted') {
    return `If ${enemyName} breaches your line, swap me in. Your safety now overrides the room.`;
  }

  if (tier === 'trusted') {
    return `Tag me if containment fails. I am prepared to intervene.`;
  }

  return `If you need a cleaner line, I can take over.`;
}

function getSecuritySkeletonActionLine(
  role: CombatBanterRole,
  tier: BondNarrativeTier,
  context: CombatActionBanterContext
) {
  if (context.actionId === 'patch') {
    if (tier === 'devoted') {
      return `Confirmed. ${context.enemy.name} is ${getEnemyPressureLabel(
        context.enemyCurrentHp,
        context.enemyMaxHp
      )}. Continue suppression.`;
    }

    if (tier === 'trusted') {
      return `Effective strike. ${context.enemy.name} is losing compliance rapidly.`;
    }

    return `Solid contact. Continue pressure.`;
  }

  if (context.actionId === 'escalate') {
    if (role === 'reserve' && tier === 'devoted') {
      return `Approved. I will absorb the response window while ${context.enemy.name} destabilizes.`;
    }

    if (tier === 'trusted') {
      return `Aggressive, but acceptable. ${context.enemy.name} is easier to contain when rattled.`;
    }

    return `Force acknowledged. Maintain control.`;
  }

  if (context.actionId === 'dodge') {
    if (tier === 'devoted') {
      return `Confirmed. The strike window broke. Continue evasive control.`;
    }

    if (tier === 'trusted') {
      return `Effective. ${context.enemy.name} is losing the line.`;
    }

    return `Good avoidance. Maintain spacing.`;
  }

  if (tier === 'devoted') {
    return `Recover. You are ${getHeroConditionLabel(
      context.heroHp,
      context.heroMaxHp
    )}, and I am still covering your perimeter.`;
  }

  if (tier === 'trusted') {
    return `Regain stability. I will hold the line.`;
  }

  return `Recovery window accepted.`;
}

function getPossessedCopierIntroLine(
  role: CombatBanterRole,
  tier: BondNarrativeTier,
  enemyName: string
) {
  if (role === 'active') {
    if (tier === 'devoted') {
      return `The copier spits out a warm page: "PRIMARY USER PROTECTED. ${enemyName.toUpperCase()} ENTERING SHREDDER STATUS."`;
    }

    if (tier === 'trusted') {
      return `A page slides out: "${enemyName.toUpperCase()} DETECTED. SUGGESTED RESPONSE: RUIN ITS WORKFLOW."`;
    }

    return `The copier prints: "TARGET LOCK: ${enemyName.toUpperCase()}."`;
  }

  if (tier === 'devoted') {
    return `The reserve tray rattles: "SWAP ME IN. I CAN MAKE A WORSE COPY OF ${enemyName.toUpperCase()}."`;
  }

  if (tier === 'trusted') {
    return `A half-page peels out: "TAG ME IN IF THIS GETS FUNNY."`;
  }

  return `The copier makes an interested noise from the backline.`;
}

function getPossessedCopierActionLine(
  role: CombatBanterRole,
  tier: BondNarrativeTier,
  context: CombatActionBanterContext
) {
  if (context.actionId === 'patch') {
    if (tier === 'devoted') {
      return `The copier flashes: "GOOD. ${context.enemy.name.toUpperCase()} IS ${getEnemyPressureLabel(
        context.enemyCurrentHp,
        context.enemyMaxHp
      ).toUpperCase()}."`;
    }

    if (tier === 'trusted') {
      return `A page blinks: "CLEAN HIT. RUN THAT AGAIN."`;
    }

    return `The copier chirps once in approval.`;
  }

  if (context.actionId === 'escalate') {
    if (role === 'reserve' && tier === 'devoted') {
      return `A fresh page lands: "LOUDER. I CAN COVER THE PAPER TRAIL."`;
    }

    if (tier === 'trusted') {
      return `The copier prints: "ESCALATION IS A VALID OUTPUT."`;
    }

    return `The back tray slams once like applause.`;
  }

  if (context.actionId === 'dodge') {
    if (tier === 'devoted') {
      return `The copier flashes: "IMPACT AVOIDED. COUNTERFILED."`;
    }

    if (tier === 'trusted') {
      return `A page lands: "GOOD. MAKE IT MISS AGAIN."`;
    }

    return `The copier makes an approving near-jam noise.`;
  }

  if (tier === 'devoted') {
    return `The copier hums softly: "PRIMARY USER ${getHeroConditionLabel(
      context.heroHp,
      context.heroMaxHp
    ).toUpperCase()}. RECOVERY ACCEPTED."`;
  }

  if (tier === 'trusted') {
    return `A page inches out: "RESET NOW. CHAOS LATER."`;
  }

  return `The copier emits a medically unhelpful reassurance noise.`;
}

function getDisillusionedTempIntroLine(
  role: CombatBanterRole,
  tier: BondNarrativeTier,
  enemyName: string
) {
  if (role === 'active') {
    if (tier === 'devoted') {
      return `I hate fights like ${enemyName}, but I hate the idea of it chewing through you more. So yes, I'm in.`;
    }

    if (tier === 'trusted') {
      return `Fine. We break ${enemyName} first, complain later.`;
    }

    return `${enemyName} is exactly why nobody stays at this company. Hit it hard.`;
  }

  if (tier === 'devoted') {
    return `If ${enemyName} gets uglier, swap me in. Apparently your disasters are my problem now.`;
  }

  if (tier === 'trusted') {
    return `Tag me if you need sarcasm sharp enough to cut through this thing.`;
  }

  return `I can cover the next shift if this gets worse.`;
}

function getDisillusionedTempActionLine(
  role: CombatBanterRole,
  tier: BondNarrativeTier,
  context: CombatActionBanterContext
) {
  if (context.actionId === 'patch') {
    if (tier === 'devoted') {
      return `Nice. ${context.enemy.name} is ${getEnemyPressureLabel(
        context.enemyCurrentHp,
        context.enemyMaxHp
      )}, which is honestly better than it deserves.`;
    }

    if (tier === 'trusted') {
      return `Good hit. Keep ${context.enemy.name} miserable.`;
    }

    return `Okay, that actually worked.`;
  }

  if (context.actionId === 'escalate') {
    if (role === 'reserve' && tier === 'devoted') {
      return `Go louder. I'll help carry the consequences if ${context.enemy.name} bites back.`;
    }

    if (tier === 'trusted') {
      return `Messy plan, solid outcome. ${context.enemy.name} hates confidence.`;
    }

    return `Sure. Make it everybody's problem.`;
  }

  if (context.actionId === 'dodge') {
    if (tier === 'devoted') {
      return `Nice. Make ${context.enemy.name} swing at nothing and it looks almost embarrassed.`;
    }

    if (tier === 'trusted') {
      return `Good dodge. That's the kind of competence this place hates.`;
    }

    return `Clean miss. I respect it, reluctantly.`;
  }

  if (tier === 'devoted') {
    return `Take the reset. You're ${getHeroConditionLabel(
      context.heroHp,
      context.heroMaxHp
    )}, and I would prefer that not become fatal.`;
  }

  if (tier === 'trusted') {
    return `Catch your breath. We can go back to bad ideas in a second.`;
  }

  return `Reset fast. I am not dragging this alone.`;
}

function getFallbackIntroLine(
  role: CombatBanterRole,
  tier: BondNarrativeTier,
  enemyName: string
) {
  if (role === 'active') {
    if (tier === 'devoted') {
      return `Stay with me. ${enemyName} is not taking this room from us.`;
    }

    if (tier === 'trusted') {
      return `We can handle ${enemyName}. Just keep the pressure clean.`;
    }

    return `${enemyName} looks dangerous. Hit first and stay moving.`;
  }

  if (tier === 'devoted') {
    return `Swap me in if ${enemyName} swings the room. I am with you all the way through this.`;
  }

  if (tier === 'trusted') {
    return `Tag me if the line breaks. I can help steady it.`;
  }

  return `I can cover the backline if this gets uglier.`;
}

function getFallbackActionLine(
  role: CombatBanterRole,
  tier: BondNarrativeTier,
  context: CombatActionBanterContext
) {
  if (context.actionId === 'patch') {
    if (tier === 'devoted') {
      return `Good. ${context.enemy.name} is ${getEnemyPressureLabel(
        context.enemyCurrentHp,
        context.enemyMaxHp
      )}. Keep the pressure on.`;
    }

    if (tier === 'trusted') {
      return `Solid hit. Keep pushing.`;
    }

    return `Good strike.`;
  }

  if (context.actionId === 'escalate') {
    if (role === 'reserve' && tier === 'devoted') {
      return `Push harder. I can cover the return swing.`;
    }

    if (tier === 'trusted') {
      return `That works. Make ${context.enemy.name} react.`;
    }

    return `Loud, but effective.`;
  }

  if (context.actionId === 'dodge') {
    if (tier === 'devoted') {
      return `Good. Make ${context.enemy.name} waste the hit and keep the edge.`;
    }

    if (tier === 'trusted') {
      return `Nice dodge. Take the free angle.`;
    }

    return `Good slip.`;
  }

  if (tier === 'devoted') {
    return `Take the reset. You're ${getHeroConditionLabel(
      context.heroHp,
      context.heroMaxHp
    )}, and I am still with you.`;
  }

  if (tier === 'trusted') {
    return `Recover now. We can finish this.`;
  }

  return `Catch your breath.`;
}

function getIntroLine(
  companionId: string,
  role: CombatBanterRole,
  bondLevel: number,
  enemyName: string
) {
  const tier = getBondNarrativeTier(bondLevel);

  if (companionId === 'former-executive-assistant') {
    return getFormerExecutiveAssistantIntroLine(role, tier, enemyName);
  }

  if (companionId === 'facilities-goblin') {
    return getFacilitiesGoblinIntroLine(role, tier, enemyName);
  }

  if (companionId === 'security-skeleton') {
    return getSecuritySkeletonIntroLine(role, tier, enemyName);
  }

  if (companionId === 'possessed-copier') {
    return getPossessedCopierIntroLine(role, tier, enemyName);
  }

  if (companionId === 'disillusioned-temp') {
    return getDisillusionedTempIntroLine(role, tier, enemyName);
  }

  return getFallbackIntroLine(role, tier, enemyName);
}

function getActionLine(
  companionId: string,
  role: CombatBanterRole,
  bondLevel: number,
  context: CombatActionBanterContext
) {
  const tier = getBondNarrativeTier(bondLevel);

  if (companionId === 'former-executive-assistant') {
    return getFormerExecutiveAssistantActionLine(role, tier, context);
  }

  if (companionId === 'facilities-goblin') {
    return getFacilitiesGoblinActionLine(role, tier, context);
  }

  if (companionId === 'security-skeleton') {
    return getSecuritySkeletonActionLine(role, tier, context);
  }

  if (companionId === 'possessed-copier') {
    return getPossessedCopierActionLine(role, tier, context);
  }

  if (companionId === 'disillusioned-temp') {
    return getDisillusionedTempActionLine(role, tier, context);
  }

  return getFallbackActionLine(role, tier, context);
}

function createCompanionEntry(
  companionId: string,
  role: CombatBanterRole,
  companionBondLevels: Record<string, number>
) {
  const companionName =
    getCompanionDefinition(companionId)?.name ?? companionId;

  return {
    companionId,
    companionName,
    role,
    bondLevel: clampBondLevel(companionBondLevels[companionId] ?? 1),
  };
}

export function createCombatIntroLogEntries(
  input: CombatCompanionInput & {
    enemy: CombatEnemyState;
  }
) {
  return [
    createCompanionEntry(
      input.activeCompanionId,
      'active',
      input.companionBondLevels
    ),
    createCompanionEntry(
      input.reserveCompanionId,
      'reserve',
      input.companionBondLevels
    ),
  ].map(({ companionId, companionName, role, bondLevel }) =>
    formatCombatCommsLine(
      role,
      companionName,
      getIntroLine(companionId, role, bondLevel, input.enemy.name)
    )
  );
}

export function createCombatActionLogEntry(
  input: CombatCompanionInput & CombatActionBanterContext
) {
  const speakerRole: CombatBanterRole =
    input.actionId === 'escalate' &&
    input.reserveCompanionId !== input.activeCompanionId
      ? 'reserve'
      : 'active';
  const companionId =
    speakerRole === 'active'
      ? input.activeCompanionId
      : input.reserveCompanionId;
  const { companionName, bondLevel } = createCompanionEntry(
    companionId,
    speakerRole,
    input.companionBondLevels
  );

  return formatCombatCommsLine(
    speakerRole,
    companionName,
    getActionLine(companionId, speakerRole, bondLevel, input)
  );
}
