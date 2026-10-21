// Companion Radio Banter & Contextual Reaction Dialogue

export interface BanterLine {
  text: string;
  mood?: 'confident' | 'strained' | 'alarmed' | 'triumphant';
}

export const COMPANION_BANTER: Record<string, {
  helpOutSuccess: BanterLine[];
  helpOutFail: BanterLine[];
  cleanHit: BanterLine[];
  costlyAdvance: BanterLine[];
  criticalBlunder: BanterLine[];
  takingDamage: BanterLine[];
}> = {
  silas_vance: {
    helpOutSuccess: [
      { text: "Flank secured, Zero. Shatter their line!", mood: 'confident' },
      { text: "Got the iron pipe ready. Swing on my mark!", mood: 'confident' },
      { text: "Two targets pinned behind the crate. Take the clean shot!", mood: 'confident' },
    ],
    helpOutFail: [
      { text: "Damn it, heavy crossfire! Can't push forward!", mood: 'strained' },
      { text: "My shotgun slide jammed on river mud! You're on your own!", mood: 'alarmed' },
    ],
    cleanHit: [
      { text: "Solid impact. That's how we broke through the Redoubt.", mood: 'triumphant' },
      { text: "Target down without a whisper. Beautiful work, Boss.", mood: 'triumphant' },
    ],
    costlyAdvance: [
      { text: "We made it through, but every patrol in the Sink heard that.", mood: 'strained' },
      { text: "Progress secured. Patch up later, let's keep moving.", mood: 'strained' },
    ],
    criticalBlunder: [
      { text: "Ambush! Drop down! They were waiting for us!", mood: 'alarmed' },
      { text: "Blunder! Fall back into the culvert, right now!", mood: 'alarmed' },
    ],
    takingDamage: [
      { text: "Ugh! Rusted shrapnel in my shoulder... Still standing!", mood: 'strained' },
      { text: "Just a graze. I've taken worse from Redoubt enforcers.", mood: 'strained' },
    ],
  },
  cora_ramos: {
    helpOutSuccess: [
      { text: "Thermal optics blinded. Slip through the shadow vent now.", mood: 'confident' },
      { text: "Sensor wire cut. You've got an eight-second blind spot.", mood: 'confident' },
    ],
    helpOutFail: [
      { text: "Laser tripwire active! Had to pull back!", mood: 'alarmed' },
      { text: "Too much ambient light here. Can't mask the acoustic signature.", mood: 'strained' },
    ],
    cleanHit: [
      { text: "Like smoke through rusted bars. Completely undetected.", mood: 'triumphant' },
      { text: "Apex security wouldn't have spotted that in a hundred shifts.", mood: 'triumphant' },
    ],
    costlyAdvance: [
      { text: "We're through, but we tripped a silent diagnostic pulse.", mood: 'strained' },
      { text: "Cover blown slightly. Pick up the pace before Heat spikes.", mood: 'strained' },
    ],
    criticalBlunder: [
      { text: "Alarm horns! Every perimeter light just went red!", mood: 'alarmed' },
      { text: "It's a trap! Scatter into the sub-ducts!", mood: 'alarmed' },
    ],
    takingDamage: [
      { text: "Ah! Cut by razor wire... I can still run, let's go!", mood: 'strained' },
      { text: "Took a hit to the ribs. Don't stop for me.", mood: 'strained' },
    ],
  },
  dr_aris_voss: {
    helpOutSuccess: [
      { text: "Neural feedback synchronized. Frequency override in three, two, one...", mood: 'confident' },
      { text: "Telemetry decrypted. Aim directly at the phosphorus node.", mood: 'confident' },
    ],
    helpOutFail: [
      { text: "Electromagnetic interference is overwhelming my cranial augments!", mood: 'alarmed' },
      { text: "Signal scrambled! I can't pierce their encryption layer!", mood: 'strained' },
    ],
    cleanHit: [
      { text: "Fascinating. The anomalous frequency stabilized perfectly.", mood: 'triumphant' },
      { text: "Clean execution. My diagnostic telemetry registers zero collateral.", mood: 'triumphant' },
    ],
    costlyAdvance: [
      { text: "A victory, yes, but the thermal surge damaged my secondary relay.", mood: 'strained' },
      { text: "We advanced, though anomalous residual radiation is climbing.", mood: 'strained' },
    ],
    criticalBlunder: [
      { text: "Critical failure! Neural feedback loop burning my cortex!", mood: 'alarmed' },
      { text: "The anomaly is folding! Egress immediately!", mood: 'alarmed' },
    ],
    takingDamage: [
      { text: "My augmentations... they took the brunt of the kinetic discharge.", mood: 'strained' },
      { text: "Hemorrhagic bleed detected. Stabilizing with bio-foam.", mood: 'strained' },
    ],
  },
  jax_tinker: {
    helpOutSuccess: [
      { text: "Pneumatics primed! Hit the hydraulic release valve now!", mood: 'confident' },
      { text: "Copper lead connected. Sparks fly on your cue!", mood: 'confident' },
    ],
    helpOutFail: [
      { text: "Pressure valve blew a seal! Steam everywhere!", mood: 'alarmed' },
      { text: "Bolt stripped! Need a moment to re-tool!", mood: 'strained' },
    ],
    cleanHit: [
      { text: "Clank! Broken clean in half. Beautiful mechanics, Boss.", mood: 'triumphant' },
      { text: "That scrap will fetch a tidy pile of chip cred.", mood: 'triumphant' },
    ],
    costlyAdvance: [
      { text: "Broke the seal, but my wrench took a beating doing it.", mood: 'strained' },
      { text: "Metal groaning loud enough to wake the Redoubt.", mood: 'strained' },
    ],
    criticalBlunder: [
      { text: "Catastrophic fracture! The whole bulkhead is caving in!", mood: 'alarmed' },
      { text: "Run! The boiler's going to blow!", mood: 'alarmed' },
    ],
    takingDamage: [
      { text: "Ow! Smashed my mechanical knuckle! Still got five good fingers.", mood: 'strained' },
      { text: "Shrapnel in my apron. Just burns, no deep cuts.", mood: 'strained' },
    ],
  },
  sister_maren: {
    helpOutSuccess: [
      { text: "The candle flickers, yet burns true. Stare past the illusion, child.", mood: 'confident' },
      { text: "I hold the threshold steady against the dark tide.", mood: 'confident' },
    ],
    helpOutFail: [
      { text: "The voices in the water... they scream too loud...", mood: 'alarmed' },
      { text: "The veil resists my prayers. Guard your mind!", mood: 'strained' },
    ],
    cleanHit: [
      { text: "The anomaly submits to divine stillness. Amen.", mood: 'triumphant' },
      { text: "Grace granted in a godless city.", mood: 'triumphant' },
    ],
    costlyAdvance: [
      { text: "We survived, but the shadows drank our warmth.", mood: 'strained' },
      { text: "Penance accepted. We carry on with heavy hearts.", mood: 'strained' },
    ],
    criticalBlunder: [
      { text: "The reality tear has opened! It hungers for our marrow!", mood: 'alarmed' },
      { text: "Mercy! The void rejects our flesh!", mood: 'alarmed' },
    ],
    takingDamage: [
      { text: "My blood mingles with holy silt. I shall endure.", mood: 'strained' },
      { text: "A martyr's wound. Do not weep for me.", mood: 'strained' },
    ],
  },
};

export function getRandomBanter(
  operativeId: string,
  event: 'helpOutSuccess' | 'helpOutFail' | 'cleanHit' | 'costlyAdvance' | 'criticalBlunder' | 'takingDamage'
): BanterLine {
  const opBanter = COMPANION_BANTER[operativeId] ?? COMPANION_BANTER['silas_vance'];
  const lines = opBanter[event];
  return lines[Math.floor(Math.random() * lines.length)];
}
