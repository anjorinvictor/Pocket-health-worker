/**
 * Pocket Health Worker — interface text, English and Nigerian Pidgin
 *
 * Every key in `en` must exist in `pcm` (TypeScript enforces it). `{name}` marks a value
 * filled in at runtime. Pidgin written 2026-11-26; owner (native speaker) to review.
 */

export const en = {
  // App shell
  brandAria: "Pocket Health Worker — go to start",
  startOver: "Start over",
  offlineTitle: "No internet — still working on your phone.",
  offlineBody: "The body map, danger-sign checks, emergency numbers and hospital list all work offline.",
  back: "Back",
  startNewCheck: "Start a new check",
  footer: "Guidance only, not a diagnosis. In an emergency call 112.",
  langSwitchTo: "Pidgin",
  langSwitchAria: "Switch language to Pidgin",
  langLabel: "Language",

  // Medicine screen
  medEyebrow: "NAFDAC check",
  medTitle: "Is this medicine genuine?",
  medIntro:
    "Fake medicines are common. NAFDAC can tell you if yours is real. This app does not decide: it only helps you ask NAFDAC.",

  // Emergency screen
  emergencyLocal: "This was decided by fixed safety rules on your phone. It is guidance, not a diagnosis.",
  emergencyLocalOffline:
    "This was decided by fixed safety rules on your phone, with no internet needed. It is guidance, not a diagnosis.",
  emergencyEyebrow: "Emergency",
  emergencyTitle: "Go to hospital now",
  emergencyNoWait: "Do not wait to see if it gets better.",
  callForHelp: "Call for help now",
  callN: "Call {n}",
  nationalNote: "National emergency line · free from any network",
  chooseStateAmbulance: "Choose your state below to see a local ambulance line where one exists.",
  noTransportTitle: "No transport?",
  noTransportBody:
    "Call a neighbour, a family member, or a keke or okada rider right now. Do not wait for morning. If the person stops breathing or will not wake up, call 112 straight away.",
  nearestHospitals: "Nearest hospitals with emergency care",
  overwhelmed: "Feeling overwhelmed or unsafe?",
  talkToMani: "Talk to MANI: {n}",

  // First aid
  firstAidTitle: "What to do on the way",
  firstAidNote: "Simple first aid, not treatment. Never give medicine unless a health worker tells you to.",

  // AI explanation on the emergency screen
  explainTitle: "What might be going on",
  explainLoading: "Getting an explanation… You do not need to wait for it. Call or go now.",
  explainFailed: "We couldn’t load an explanation right now. That does not change anything: please get help now.",
  mostLikely: "Most likely: ",
  itCouldBe: "It could be",
  infoOnly: "(informational only)",
  explainNotDx: "Not a diagnosis. Only a health worker can say for sure, which is why you need to go now.",

  // Urgency labels
  urgencyGREEN: "Care at home",
  urgencyYELLOW: "Visit a clinic",
  urgencyRED: "Emergency now",

  // AI result
  headlineGREEN: "You can likely look after this at home",
  headlineYELLOW: "See a health worker within 1–2 days",
  whatMightBeWrong: "What might be wrong",
  itCouldAlsoBe: "It could also be",
  notDxExam: "Not a diagnosis. Only a health worker who examines you can confirm what it is.",
  whyWeThink: "Why we think so",
  whatToDoNigeria: "What to do (Nigeria)",
  continueChat: "Continue the conversation",

  // Rules result
  reasonOfflineTitle: "Checked on your phone, with no internet",
  reasonOfflineBody:
    "This answer comes from fixed safety rules that work offline. When you have signal, you can also describe it in your own words for a fuller check.",
  reasonDataSaverTitle: "Checked on your phone (Data Saver)",
  reasonDataSaverBody: "Data Saver is on, so fixed safety rules on your phone gave this answer without using data.",
  reasonUnavailableTitle: "Checked on your phone",
  reasonUnavailableBody:
    "The full assistant could not be reached just now, so fixed safety rules on your phone gave this answer.",
  whatToDo: "What to do",
  getHelpSoonerIf: "Get help sooner if",
  rulesDisclaimer:
    "This check uses general safety rules and only what you told us. It is not a diagnosis and does not replace a health worker. If you are worried, get care.",

  // Connect to a health worker
  connectButton: "Connect to a health worker",
  comingSoon: "Coming soon",
  connectBody:
    "Soon you will be able to share this check, with your permission, with a trained Community Health Worker near you for a follow-up, a referral, or help getting to care.",
  connectPoint1: "Hand your check to a health worker, only if you agree",
  connectPoint2: "Follow-up by SMS or WhatsApp, even on a basic phone",
  connectPoint3: "Referral to the nearest PHC or hospital",
  connectNotYet: "This is not available yet. If you need care now, use the hospital list and 112.",
  gotIt: "Got it",

  // Share
  shareCheck: "Share this check",
  shareCopied: "Copied — paste it into WhatsApp or SMS",
  shareFailed: "Sharing isn’t available on this phone. You can take a screenshot instead.",

  // Show the nurse
  nurseButton: "Show this to the nurse",
  nurseInstruction: "Show this screen to the nurse or doctor.",
  close: "Close",

  // Install
  installTitle: "Keep it on your phone",
  installBody: "Add it to your home screen. It opens like an app and works with no internet.",
  installButton: "Install on this phone",
  installIos: "On iPhone: tap the Share button, then “Add to Home Screen”.",
  installOther: "Open your browser menu (⋮) and tap “Install app” or “Add to Home screen”.",
  installDone: "Installed. You can open it from your home screen, even with no internet.",

  // Crisis
  crisisTitle: "You are not alone.",
  crisisBody1:
    "It sounds like you are carrying something very heavy right now. Thank you for saying it. Your life matters.",
  crisisBody2:
    "Please talk to someone today: a person you trust, a friend, a religious or community leader, or a health worker. You do not have to carry this by yourself.",
  talkToSomeone: "Talk to someone now",
  inDanger: "If you are in danger right now",
  crisisFoot: "Or go to the nearest hospital. This app gives information only and cannot replace a counsellor.",
  backToStart: "Back to the start",

  // Welcome
  welcomeEyebrow: "Free · Private · Works offline",
  welcomeTitle: "A calm hand for when you can’t reach a doctor.",
  welcomeIntro:
    "Tell us what is wrong, in your own words or by tapping where it hurts. In about a minute you will know the next step: care at home, visit a clinic, or go to hospital now.",
  modeChat: "Describe it in your own words",
  modeChatSub: "A short, gentle conversation",
  modeBody: "Tap where it hurts",
  modeBodySub: "Works without internet",
  modeMedicine: "Check a medicine",
  modeMedicineSub: "Is it genuine? Ask NAFDAC by SMS",
  welcomeCall: "In an emergency, call {n} now",
  levelsTitle: "One clear next step",
  levelGREEN: "Look after it at home, and what to watch for.",
  levelYELLOW: "See a health worker at a PHC or clinic within 1–2 days.",
  levelRED: "Go to hospital now, with 112 one tap away.",
  promiseTitle: "Our privacy promise",
  promiseBody:
    "No account, no tracking, no cookies. Nothing you enter is saved. When you are online, your answers are sent to an AI service to write your guidance, and are not stored by us.",
  struggling: "Struggling emotionally?",
  findSupport: "Find support",
  welcomeFoot: "Guidance, not diagnosis. Never a replacement for a health worker.",

  // Chat
  chatAria: "Symptom conversation",
  chatTitle: "Tell me what’s wrong",
  chatIntro:
    "Describe how you or the person you care for feels, in your own words. I’ll ask a few short questions, then tell you how urgent it is and where to go.",
  chatChecking: "Checking your answers",
  chatLog: "Conversation",
  youSaid: "You said: ",
  phwSaid: "Pocket Health Worker: ",
  chatLabel: "Describe how you feel",
  chatPlaceholder: "For example: my baby has had a high fever since last night",
  send: "Send",
  useBodyMap: "Use the body map instead",
  chatOffline:
    "You're offline, so I can't read typed messages right now. No danger signs were found in what you wrote. The body map works without internet — tap the button below to use it.",
  chatWeak:
    "The connection is too weak right now. No danger signs were found in what you wrote. You can try again, or use the body map — it works without internet. If you are worried, see a health worker.",

  // Data Saver
  dataSaverOn: "Data Saver on",
  dataSaverOff: "Data Saver off",
  dataSaver: "Data Saver",
  dataSaverDesc: "Uses less data: emergencies are answered on your phone, and AI answers are kept short.",
  on: "On",
  off: "Off",
  healthTools: "Health tools",

  // Hospital finder
  findHospital: "Find a hospital near you",
  yourState: "Your state",
  chooseState: "Choose your state",
  findingState: "Finding your state…",
  useMyLocation: "Use my location",
  geoUnavailable: "Location isn't available on this phone. Please choose your state.",
  geoFailed: "Couldn't get your location. Please choose your state.",
  mapNearMe: "Hospitals and clinics near me (map)",
  mapSearch: "Search hospitals near me (map)",
  mapNoteHere: "Opens Google Maps at where you are now. It shows every nearby hospital and clinic, and needs internet.",
  mapNote: "Opens Google Maps. It shows every nearby hospital and clinic, and needs internet.",
  call112Free: "Call {n} · emergency (free)",
  directions: "Directions",
  directionsTo: "Directions to {name}",
  chooseStateForList: "Choose your state to see the main public hospitals with emergency care.",
  hospitalListNote:
    "This list shows only the main public hospitals in each state, not every hospital. Use the map above to find the closest one to you. We only list numbers we have checked: call 112 and ask for the nearest hospital.",

  // NAFDAC
  masTitle: "1. Scratch code on the pack",
  masStrongest: "The strongest check. Works without data.",
  masPin: "PIN under the scratch panel",
  masPinPlaceholder: "Numbers only",
  masCode: "Short code printed beside the panel",
  masCodePlaceholder: "For example 38353",
  masOpenSms: "Open SMS to send the PIN",
  masNote:
    "Your phone texts the PIN to NAFDAC's verification service. The reply SMS tells you if the medicine is genuine. Texting the PIN is free and works without data.",
  nrnTitle: "2. NAFDAC registration number",
  nrnLabel: "NAFDAC Reg. No. on the pack",
  nrnPlaceholder: "For example A4-1234",
  nrnSearch: "Search NAFDAC Greenbook",
  nrnCopied: "Number copied. Paste it into the “NAFDAC Reg. No.” box on the Greenbook page.",
  nrnNote: "Opens NAFDAC's official list of registered medicines (needs data).",
  nrnFakers: "Fakers sometimes copy real registration numbers, so the scratch-code check is the stronger test.",

  // Body map
  whereHurts: "Where does it hurt?",
  stepN: "Step {n}",
  step1Title: "Tap the part of the body",
  bodyView: "Body view",
  front: "Front",
  backView: "Back",
  bodySvg: "Human body, {view} view",
  wholeBody: "Whole body / general feeling",
  orList: "Or choose from a list",
  chooseArea: "Choose a body area",
  regionSelected: "{region} selected",
  step2Title: "{region}: what do you feel?",
  step2Empty: "What do you feel there?",
  step2Hint: "Choose a part of the body in step 1 to see what you might feel there.",
  step3Title: "How strong does it feel?",
  step4Title: "How long has it been going on?",
  step5Title: "How old is the person who is unwell?",
  step6Title: "Sex and pregnancy",
  step7N: "Step 7 · optional",
  step7Title: "Any long-term health conditions?",
  step7Hint: "Leave empty if none. We only use what you choose here.",
  optional: "Optional",
  extraLabel: "Anything else to add?",
  extraPlaceholder: "In your own words…",
  submit: "See what to do next",
  ready: "Ready. This takes a few seconds.",
  stillNeeded: "Still needed: {list}.",
  missRegion: "where it hurts",
  missSeverity: "how strong",
  missDuration: "how long",
  missAge: "age",
  missSex: "sex / pregnancy",
} as const;

export type StringKey = keyof typeof en;

export const pcm: Record<StringKey, string> = {
  brandAria: "Pocket Health Worker — go back to start",
  startOver: "Start again",
  offlineTitle: "No network — e still dey work for your phone.",
  offlineBody: "Body map, danger-sign check, emergency numbers and hospital list — all of dem dey work without internet.",
  back: "Go back",
  startNewCheck: "Start new check",
  footer: "Na guidance only, no be diagnosis. If na emergency, call 112.",
  langSwitchTo: "English",
  langSwitchAria: "Change language to English",
  langLabel: "Language",

  medEyebrow: "NAFDAC check",
  medTitle: "This medicine na original?",
  medIntro:
    "Fake medicine plenty for market. NAFDAC fit tell you if your own na original. This app no dey decide am: e just dey help you ask NAFDAC.",

  emergencyLocal: "Na fixed safety rules for your phone decide this one. Na guidance, no be diagnosis.",
  emergencyLocalOffline:
    "Na fixed safety rules for your phone decide this one, no internet needed. Na guidance, no be diagnosis.",
  emergencyEyebrow: "Emergency",
  emergencyTitle: "Go hospital now now",
  emergencyNoWait: "No wait make e better by itself.",
  callForHelp: "Call for help now now",
  callN: "Call {n}",
  nationalNote: "National emergency line · free for any network",
  chooseStateAmbulance: "Choose your state for down to see ambulance line for your area, if e dey.",
  noTransportTitle: "No motor?",
  noTransportBody:
    "Call your neighbour, your family, or keke or okada rider now now. No wait till morning. If the person stop to breathe or e no wan wake, call 112 sharp sharp.",
  nearestHospitals: "Hospitals near you wey get emergency care",
  overwhelmed: "E don too much for you, or you no feel safe?",
  talkToMani: "Talk to MANI: {n}",

  firstAidTitle: "Wetin to do for road",
  firstAidNote: "Na simple first aid, no be treatment. No give any medicine unless health worker tell you.",

  explainTitle: "Wetin fit dey happen",
  explainLoading: "We dey find explanation… You no need wait for am. Call or go now now.",
  explainFailed: "We no fit load explanation now. E no change anything: abeg go get help now now.",
  mostLikely: "E resemble say na: ",
  itCouldBe: "E fit be",
  infoOnly: "(na just information)",
  explainNotDx: "No be diagnosis. Na only health worker fit talk am for sure, na why you need go now now.",

  urgencyGREEN: "Care for house",
  urgencyYELLOW: "Go clinic",
  urgencyRED: "Emergency now now",

  headlineGREEN: "You fit take care of this one for house",
  headlineYELLOW: "See health worker inside 1–2 days",
  whatMightBeWrong: "Wetin fit dey wrong",
  itCouldAlsoBe: "E still fit be",
  notDxExam: "No be diagnosis. Na only health worker wey check you well fit confirm wetin e be.",
  whyWeThink: "Why we talk am",
  whatToDoNigeria: "Wetin to do (Naija)",
  continueChat: "Continue the gist",

  reasonOfflineTitle: "We check am for your phone, without internet",
  reasonOfflineBody:
    "This answer come from fixed safety rules wey dey work without network. When you get network, you fit also talk am for your own words for fuller check.",
  reasonDataSaverTitle: "We check am for your phone (Data Saver)",
  reasonDataSaverBody: "Data Saver dey on, so fixed safety rules for your phone give this answer without using data.",
  reasonUnavailableTitle: "We check am for your phone",
  reasonUnavailableBody:
    "We no fit reach the full assistant now, so fixed safety rules for your phone give this answer.",
  whatToDo: "Wetin to do",
  getHelpSoonerIf: "Go get help quick if",
  rulesDisclaimer:
    "This check dey use general safety rules and only wetin you tell us. E no be diagnosis and e no fit replace health worker. If e dey worry you, go get care.",

  connectButton: "Connect with health worker",
  comingSoon: "E dey come soon",
  connectBody:
    "Soon, you go fit share this check — only if you agree — with trained Community Health Worker near you, for follow-up, referral, or help to reach care.",
  connectPoint1: "Give your check to health worker, only if you agree",
  connectPoint2: "Follow-up by SMS or WhatsApp, even for small phone",
  connectPoint3: "Referral to the nearest PHC or hospital",
  connectNotYet: "E never ready yet. If you need care now, use the hospital list and 112.",
  gotIt: "I don hear",

  shareCheck: "Share this check",
  shareCopied: "We don copy am — paste am for WhatsApp or SMS",
  shareFailed: "Sharing no dey work for this phone. You fit take screenshot instead.",

  nurseButton: "Show am to the nurse",
  nurseInstruction: "Show this screen to the nurse or doctor.",
  close: "Close am",

  installTitle: "Keep am for your phone",
  installBody: "Put am for your home screen. E go open like app and e go work without internet.",
  installButton: "Install am for this phone",
  installIos: "For iPhone: press the Share button, then “Add to Home Screen”.",
  installOther: "Open your browser menu (⋮) and press “Install app” or “Add to Home screen”.",
  installDone: "E don install. You fit open am from your home screen, even without internet.",

  crisisTitle: "You no dey alone.",
  crisisBody1:
    "E be like say you dey carry heavy load for your mind now. Thank you say you talk am. Your life matter well well.",
  crisisBody2:
    "Abeg talk to person today: somebody wey you trust, your friend, your pastor, imam or community leader, or health worker. You no need carry this thing alone.",
  talkToSomeone: "Talk to person now",
  inDanger: "If you dey for danger now now",
  crisisFoot: "Or go the nearest hospital. This app na just information, e no fit replace counsellor.",
  backToStart: "Go back to start",

  welcomeEyebrow: "Free · Private · E dey work without network",
  welcomeTitle: "Calm helping hand for when you no fit reach doctor.",
  welcomeIntro:
    "Tell us wetin dey worry you, for your own words or make you touch where e dey pain you. For like one minute, you go know wetin to do next: take care of am for house, go clinic, or go hospital now now.",
  modeChat: "Talk am for your own words",
  modeChatSub: "Short, gentle gist",
  modeBody: "Touch where e dey pain you",
  modeBodySub: "E dey work without internet",
  modeMedicine: "Check your medicine",
  modeMedicineSub: "E na original? Ask NAFDAC by SMS",
  welcomeCall: "If na emergency, call {n} now now",
  levelsTitle: "One clear thing to do next",
  levelGREEN: "Take care of am for house, plus wetin to watch for.",
  levelYELLOW: "See health worker for PHC or clinic inside 1–2 days.",
  levelRED: "Go hospital now now, 112 dey one press away.",
  promiseTitle: "Our privacy promise",
  promiseBody:
    "No account, no tracking, no cookies. We no dey save anything wey you enter. When you get network, we dey send your answers to AI service to write your guidance, and we no dey keep am.",
  struggling: "E dey hard for your mind?",
  findSupport: "Find person to talk to",
  welcomeFoot: "Na guidance, no be diagnosis. E no fit replace health worker.",

  chatAria: "Symptom conversation",
  chatTitle: "Tell me wetin dey worry you",
  chatIntro:
    "Talk how you dey feel, or how the person wey you dey care for dey feel, for your own words. I go ask small questions, then I go tell you how serious e be and where to go.",
  chatChecking: "We dey check your answers",
  chatLog: "Conversation",
  youSaid: "You talk: ",
  phwSaid: "Pocket Health Worker: ",
  chatLabel: "Talk how you dey feel",
  chatPlaceholder: "Like: my pikin body dey hot well well since yesterday night",
  send: "Send",
  useBodyMap: "Use body map instead",
  chatOffline:
    "You no get network now, so I no fit read wetin you type. We no see any danger sign for wetin you write. Body map dey work without internet — press the button for down to use am.",
  chatWeak:
    "Network too weak now. We no see any danger sign for wetin you write. You fit try again, or use body map — e dey work without internet. If e dey worry you, go see health worker.",

  dataSaverOn: "Data Saver on",
  dataSaverOff: "Data Saver off",
  dataSaver: "Data Saver",
  dataSaverDesc: "E dey use small data: emergency answer dey come from your phone, and AI answer go short.",
  on: "On",
  off: "Off",
  healthTools: "Health tools",

  findHospital: "Find hospital near you",
  yourState: "Your state",
  chooseState: "Choose your state",
  findingState: "We dey find your state…",
  useMyLocation: "Use where I dey",
  geoUnavailable: "Location no dey work for this phone. Abeg choose your state.",
  geoFailed: "We no fit find where you dey. Abeg choose your state.",
  mapNearMe: "Hospitals and clinics near me (map)",
  mapSearch: "Find hospitals near me (map)",
  mapNoteHere:
    "E go open Google Maps for where you dey now. E go show all the hospitals and clinics near you, but e need internet.",
  mapNote: "E go open Google Maps. E go show all the hospitals and clinics near you, but e need internet.",
  call112Free: "Call {n} · emergency (free)",
  directions: "Direction",
  directionsTo: "Direction to {name}",
  chooseStateForList: "Choose your state to see the big government hospitals wey get emergency care.",
  hospitalListNote:
    "This list na only the big government hospitals for each state, no be every hospital. Use the map for up to find the one wey near you pass. We only dey put numbers wey we don check: call 112 and ask for the nearest hospital.",

  masTitle: "1. Scratch code for the pack",
  masStrongest: "Na the strongest check. E dey work without data.",
  masPin: "PIN wey dey under the scratch panel",
  masPinPlaceholder: "Only numbers",
  masCode: "Short code wey dem print beside the panel",
  masCodePlaceholder: "Like 38353",
  masOpenSms: "Open SMS to send the PIN",
  masNote:
    "Your phone go text the PIN to NAFDAC verification service. The SMS wey go reply go tell you if the medicine na original. To text the PIN na free, and e no need data.",
  nrnTitle: "2. NAFDAC registration number",
  nrnLabel: "NAFDAC Reg. No. wey dey the pack",
  nrnPlaceholder: "Like A4-1234",
  nrnSearch: "Search NAFDAC Greenbook",
  nrnCopied: "We don copy the number. Paste am for the “NAFDAC Reg. No.” box for Greenbook page.",
  nrnNote: "E go open NAFDAC official list of registered medicine (e need data).",
  nrnFakers: "Fake people dey sometimes copy real registration number, so the scratch-code check na the stronger test.",

  whereHurts: "Where e dey pain you?",
  stepN: "Step {n}",
  step1Title: "Touch the part of the body",
  bodyView: "Body view",
  front: "For front",
  backView: "For back",
  bodySvg: "Human body, {view} view",
  wholeBody: "Whole body / how body dey feel generally",
  orList: "Or choose from list",
  chooseArea: "Choose part of body",
  regionSelected: "You don choose {region}",
  step2Title: "{region}: wetin you dey feel?",
  step2Empty: "Wetin you dey feel there?",
  step2Hint: "Choose part of the body for step 1 to see wetin you fit dey feel there.",
  step3Title: "How e strong reach?",
  step4Title: "How long e don dey?",
  step5Title: "How old the person wey sick be?",
  step6Title: "Man or woman, and belle",
  step7N: "Step 7 · if you like",
  step7Title: "Any long-time sickness?",
  step7Hint: "Leave am empty if none. We only dey use wetin you choose here.",
  optional: "If you like",
  extraLabel: "Anything else wey you wan add?",
  extraPlaceholder: "For your own words…",
  submit: "See wetin to do next",
  ready: "E don ready. E go take few seconds.",
  stillNeeded: "Still need: {list}.",
  missRegion: "where e dey pain",
  missSeverity: "how e strong",
  missDuration: "how long",
  missAge: "age",
  missSex: "man or woman / belle",
};
