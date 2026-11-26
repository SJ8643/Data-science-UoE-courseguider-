/* gens_spi.js – ECM1407 Social and Professional Issues: unlimited questions for each week. The module is
   assessed by a 2,000-word essay (80%) and a group presentation (20%), so questions train exact knowledge of
   the cases and laws, applying theories and codes to scenarios, and essay-style argument with a mark scheme. */
(function () {
  'use strict';
  const P = window.GUIDE.P, R = P.R, f = P.fmt;
  const S = function (deck, kw) { return P.slide(deck, kw); };
  const W1 = 'spi-week-01', W2 = 'spi-week-02', W3 = 'spi-week-03', W4 = 'spi-week-04', W5 = 'spi-week-5-software-contract', W7 = 'spi-week-7-professional-issues', W8 = 'spi-week-08-social-issues-1', W9 = 'spi-week-09';
  const WHO = ['Alex', 'Priya', 'Tom', 'Mei', 'Kwame', 'Sofia', 'Dan', 'Leila', 'Ollie', 'Hana'];
  const ORG = ['a Devon hospital trust', 'a high-street bank', 'the university', 'an online retailer', 'a local council', 'a games studio', 'a delivery start-up'];
  const ESSAY = ['Thesis: a clear position that answers the question (1)', 'Evidence from the lectures: named cases, laws or figures, used accurately (2)', 'Analysis: explains why the evidence supports the claim, not just what happened (2)', 'A counter-argument, fairly stated and answered (2)', 'A conclusion that follows from the argument (1)'];
  function essay(q, model, extra) { return P.written(q + ' Write a thesis and the plan of your argument: one or two sentences per point.', 8, ESSAY, model, Object.assign({ essay: true }, extra || {})); }

  /* ===== Week 1: history of computing ===== */
  const EVENTS = [['The Antikythera mechanism, the oldest known analogue computer', -100], ['Wilhelm Schickard’s calculating machine', 1623], ['Leibniz’s machine that could multiply and divide', 1673], ['Babbage announces the Difference Engine', 1822], ['Babbage designs the Analytical Engine', 1837],
    ['Ada Lovelace publishes her notes, including Note G', 1843], ['Boole’s algebra of logic', 1847], ['Shannon’s thesis on Boolean algebra for switching circuits', 1937], ['UNIVAC, the first commercial vacuum-tube computer', 1951], ['IBM System/360 introduces the computer family', 1964], ['Intel 4004, a CPU on one chip', 1971], ['The Cray-1 supercomputer', 1975]];
  P.week('spi', 1, 'The history of computing', { lessons: ['spi-history'] }, [
    ['Which came first?', function () {
      const ev = R.sample(EVENTS, 4), first = ev.slice().sort(function (a, b) { return a[1] - b[1]; })[0];
      return P.mcq('Which of these came first?', first[0], ev.filter(function (e) { return e !== first; }).map(function (e) { return e[0]; }), 'Dates: ' + ev.slice().sort(function (a, b) { return a[1] - b[1]; }).map(function (e) { return e[0] + ' (' + (e[1] < 0 ? '~100 BC' : e[1] === 1673 ? '1670s' : e[1]) + ')'; }).join('; ') + '.', { src: S(W1, 'Antikythera') });
    }],
    ['Generations of computers', function () {
      return P.cls([['the vacuum tube (UNIVAC, 1951)', 'First generation (1950–59)', 'Vacuum tubes as logic gates: hot, heavy, unreliable.'], ['the transistor (IBM System/360, 1964)', 'Second generation (1960–68)', 'Gates without the tubes’ power use.'], ['the integrated circuit (Cray-1)', 'Third generation (1969–77)', 'Smaller, cheaper, more reliable.'],
        ['the microprocessor, a whole CPU on one chip (IBM PC)', 'Fourth generation (1978–2009)', 'Intel 4004 (1971); the open-architecture PC.'], ['the system on a chip (SoC)', 'Fifth generation (2010–)', 'The post-PC era: phones, cloud, AI.']], 'Which generation is defined by %s?', ['First generation (1950–59)', 'Second generation (1960–68)', 'Third generation (1969–77)', 'Fourth generation (1978–2009)', 'Fifth generation (2010–)'], { src: S(W1, 'Generation') });
    }],
    ['Who did what?', function () {
      return P.cls([['Designed the Analytical Engine, with a store and a mill', 'Charles Babbage', 'Also the Difference Engine.'], ['Wrote Note G, showing how the Analytical Engine could be programmed', 'Ada Lovelace', 'She saw the program as distinct from the machine.'], ['Created an algebra of logic in 1847', 'George Boole', 'Symbols for classes that obey algebraic laws.'],
        ['Showed that Boolean algebra can design switching circuits', 'Claude Shannon', 'His 1937 master’s thesis turned circuit design into a science.'], ['Built the first automatic mechanical calculator, in 1623', 'Wilhelm Schickard', 'It added and subtracted six-digit numbers.'], ['Built a calculating machine that could also multiply and divide', 'Gottfried Leibniz', 'In the 1670s.']],
        'Who is this?<br><b>%s</b>', ['Charles Babbage', 'Ada Lovelace', 'George Boole', 'Claude Shannon', 'Wilhelm Schickard', 'Gottfried Leibniz'], { src: S(W1, 'Lovelace') });
    }],
    ['The Analytical Engine', function () {
      return P.cls([['the mill', 'The CPU', 'Where calculation happened.'], ['the store', 'Memory', 'Held numbers waiting to be used.'], ['punched cards feeding in instructions and data', 'Input', 'Borrowed from the Jacquard loom.'], ['the printer', 'Output', 'Results out of the machine.']], 'In Babbage’s Analytical Engine, what does <b>%s</b> correspond to in a modern computer?', ['The CPU', 'Memory', 'Input', 'Output'], { src: S(W1, 'mill') });
    }],
    ['Essay skills: significance', function () {
      const T = R.pick([['Why is Ada Lovelace remembered as a visionary rather than only as a mathematician?', 'Thesis: Lovelace saw that a machine could be directed by a program to do more than arithmetic. Evidence: Note G (1843) set out how the Analytical Engine could compute a sequence; Babbage built the mechanism, she described the program. Analysis: this separates machine from program, the distinction modern computing rests on. Counter: the machine was never built and Babbage shared the ideas; but her notes are the clearest early statement of it. Conclusion: visionary because she moved the question from “can it calculate?” to “what can we tell it to do?”.'],
        ['How did Shannon’s 1937 thesis change the history of computing?', 'Thesis: Shannon connected Boole’s 1847 algebra to electrical switches, so logic could be built in hardware. Evidence: his thesis used Boolean algebra to design switching circuits. Analysis: with vacuum tubes as fast switches this made electronic computers possible (UNIVAC 1951), and design became a science rather than an art. Counter: engineers were building relay machines anyway; but without a theory, design did not scale. Conclusion: the bridge from logic to electronics.']]);
      return essay(T[0], T[1], { src: S(W1, 'Shannon') });
    }]
  ]);

  /* ===== Week 2: security and cryptography ===== */
  function caesar(s, k) { return s.toUpperCase().replace(/[A-Z]/g, function (ch) { return String.fromCharCode((ch.charCodeAt(0) - 65 + k + 26) % 26 + 65); }); }
  P.week('spi', 2, 'Security, cryptography and society', { lessons: ['spi-security'] }, [
    ['Threats and what they attack', function () {
      const who = R.pick(WHO), org = R.pick(ORG);
      const T = R.pick([['floods ' + org + '’s website with fake requests until real users cannot reach it', 'Interruption', 'Availability'], ['listens to unencrypted Wi-Fi traffic at ' + org + ' and reads staff emails', 'Interception', 'Confidentiality'],
        ['changes the amount in a payment instruction while it travels to ' + org, 'Modification', 'Integrity'], ['sends messages that claim to come from ' + org + ', with a fake sign-in page', 'Fabrication', 'Authentication']]);
      if (R.chance(0.5)) return P.mcq(who + ' ' + T[0] + '. Which property of secure communication is attacked?', T[2], ['Availability', 'Confidentiality', 'Integrity', 'Authentication'].filter(function (x) { return x !== T[2]; }), 'Interruption → availability (denial of service); interception → confidentiality (snooping); modification → integrity (man in the middle); fabrication → authentication (masquerading).', { src: S(W2, 'Interruption') });
      return P.mcq(who + ' ' + T[0] + '. Which kind of threat is this?', T[1], ['Interruption', 'Interception', 'Modification', 'Fabrication'].filter(function (x) { return x !== T[1]; }), 'It attacks ' + T[2].toLowerCase() + '. Interruption → availability, interception → confidentiality, modification → integrity, fabrication → authentication.', { src: S(W2, 'Fabrication') });
    }],
    ['Caesar and shift ciphers', function () {
      const w = R.pick(['EXETER', 'ATTACK', 'SECRET', 'PYTHON', 'CIPHER', 'DEVON', 'LOGIC', 'ESSAY']), k = R.chance(0.5) ? 3 : R.int(1, 25), enc = R.chance(0.5);
      return P.text(enc ? 'Encrypt <b>' + w + '</b> with a shift cipher, key ' + k + (k === 3 ? ' (Caesar’s own shift)' : '') + '.' : 'This was encrypted with a shift cipher, key ' + k + ': <b>' + caesar(w, k) + '</b>. Decrypt it.', 'caps', [enc ? caesar(w, k) : w],
        'Shift each letter ' + k + ' places ' + (enc ? 'forward' : 'back') + ', wrapping Z round to A. ' + (enc ? w + ' → ' + caesar(w, k) : caesar(w, k) + ' → ' + w) + '. With only 26 keys an attacker can try them all: it fails the sufficient key-space principle.', { src: S(W2, 'Caesar') });
    }],
    ['Kerckhoffs and key space', function () {
      const r = R.pick([['A company keeps its encryption algorithm secret and says that makes it safe. Which principle rejects this?', 'Kerckhoffs’ principle: only the key should be secret; the method must be safe even if the enemy knows it', ['The sufficient key-space principle', 'The weakest-link principle', 'Deny first, permit only when required'], 'Relying on a secret method is security by obscurity. Once the method leaks, everything fails.'],
        ['Why is a shift cipher insecure even if the attacker does not know the key?', 'There are only 26 keys, so every key can be tried quickly', ['It uses letters instead of numbers', 'The method is public', 'It is symmetric'], 'The sufficient key-space principle: there must be too many keys to try them all.'],
        ['A mono-alphabetic substitution cipher has 26! ≈ 2⁸⁸ keys. Why can it still be broken easily?', 'Letter frequencies survive encryption (E is still the most common letter), so it can be cracked without trying every key', ['26! is too small for modern computers', 'The key must be sent with the message', 'It breaks Kerckhoffs’ principle'], 'A large key space is necessary but not sufficient: the cipher must also hide patterns.']]);
      return P.mcq(r[0], r[1], r[2], r[3], { src: S(W2, 'Kerckhoffs') });
    }],
    ['Symmetric or public-key?', function () {
      return P.cls([['Two people who have never met need to agree a secret over the internet', 'Public-key cryptography', 'The receiver publishes an encryption key; only their private key decrypts.'], ['Encrypting a laptop disk with a password only its owner knows', 'Symmetric-key cryptography', 'The same secret encrypts and decrypts.'],
        ['Diffie–Hellman (1976) and RSA (1978)', 'Public-key cryptography', 'The breakthroughs that solved the key-agreement problem.'], ['Caesar’s cipher', 'Symmetric-key cryptography', 'Sender and receiver share the shift.']], 'Which kind of cryptography fits?<br><b>%s</b>', ['Symmetric-key cryptography', 'Public-key cryptography'], { src: S(W2, 'public') });
    }],
    ['Security principles', function () {
      return P.cls([['A bank puts a 3-metre fence on one side of its yard and none on the other', 'The weakest link: a system is only as strong as its weakest part', 'Raising one fence post is pointless if the enemy can walk round it.'], ['A website lets you reset your password with your mother’s maiden name', 'Do not authenticate with public information', 'The name is in public records; the flaw is using it as a secret.'],
        ['A firewall blocks all traffic except the few services the policy allows', 'Deny first, permit only when required', 'Default-deny limits what an attacker can reach.'], ['A disgruntled employee copies the customer database', 'Threats can come from inside', 'Insiders already pass the outer defences.'],
        ['A shop spends more on locks than the stock is worth', 'Security is a cost–benefit trade-off', 'Aim for “as secure as possible within the constraints”.'], ['Servers are in an unlocked cupboard by the lifts', 'Do not forget physical security', 'Anyone who can touch the machine can bypass software controls.']],
        'Which principle does this illustrate?<br><b>%s</b>', ['The weakest link: a system is only as strong as its weakest part', 'Do not authenticate with public information', 'Deny first, permit only when required', 'Threats can come from inside', 'Security is a cost–benefit trade-off', 'Do not forget physical security'], { src: S(W2, 'weakest') });
    }],
    ['Essay skills: security trade-offs', function () {
      return essay('“More security is always better.” Discuss, using examples from the lecture.', 'Thesis: no; the aim is “as secure as possible within the constraints” of cost, usability and convenience. Evidence: cost–benefit analysis of attack value versus defence cost; weakest link (fence post); mothers’ maiden names show that adding a check can add no security. Analysis: extra measures that users bypass, or that protect the wrong place, waste money. Counter: for critical systems (hospitals, banks) failures are catastrophic, so heavy spending is justified; even there, controls are chosen by risk. Conclusion: better security, not more.', { src: S(W2, 'trade') });
    }]
  ]);

  /* ===== Week 3: intellectual property ===== */
  P.week('spi', 3, 'Intellectual property', { lessons: ['spi-ip'] }, [
    ['Which protection?', function () {
      return P.cls([['the source code of your coursework project', 'Copyright', 'Automatic for literary works, which include code.'], ['Amazon’s 1-Click ordering method', 'Patent', 'An invention: new, inventive and industrially applicable.'], ['the word “Microsoft” on software boxes', 'Trademark', 'A sign that identifies the source of goods.'],
        ['the Coca-Cola recipe', 'Trade secret', 'Protected as long as it stays secret.'], ['the RSA encryption method', 'Patent', 'An invention (the slides’ example).'], ['Google’s search algorithm details', 'Trade secret', 'Kept confidential for competitive advantage.'], ['a novel about a young wizard', 'Copyright', 'The text is protected, not the idea of a wizard story.'], ['the WD-40 formula', 'Trade secret', 'Never patented, so never disclosed.'], ['a company logo', 'Trademark', 'Registered sign.']],
        'Which kind of intellectual property protects <b>%s</b>?', ['Copyright', 'Patent', 'Trademark', 'Trade secret'], { src: S(W3, 'Trademark') });
    }],
    ['Who owns the copyright?', function () {
      const who = R.pick(WHO), org = R.pick(ORG);
      return P.cls([[who + ', a developer employed by ' + org + ', writes an app as part of their job', 'The employer, ' + org, 'Work made in the course of employment belongs to the employer.'], [who + ', a freelancer, writes software for ' + org + ' with no contract assigning copyright', who + ', the freelancer', 'Without an assignment the author keeps copyright; the client may only have a licence.'],
        [who + ' writes software for ' + org + ' under a contract that assigns copyright to the client on completion', 'The client, ' + org, 'Copyright can be transferred by contract; the software contract lecture covers this clause.']], 'Who first owns the copyright?<br><b>%s</b>', ['The employer, ' + org, who + ', the freelancer', 'The client, ' + org, 'Nobody: software cannot be copyrighted'], { src: S(W3, 'employment') });
    }],
    ['How long does it last?', function () {
      return P.cls([['copyright in software', 'The author’s life plus 70 years (usually)', 'Software is protected as a literary work.'], ['a patent', '20 years', 'In exchange for publishing how the invention works.'], ['a trademark', 'As long as it is renewed and used', 'It can last indefinitely.'], ['a trade secret', 'As long as it stays secret', 'Once disclosed, protection is lost.']], 'How long does <b>%s</b> last?', ['The author’s life plus 70 years (usually)', '20 years', 'As long as it is renewed and used', 'As long as it stays secret'], { src: S(W3, '70') });
    }],
    ['Copyright exceptions', function () {
      return P.cls([['Quoting two lines of a game’s dialogue in a published review', 'Allowed: criticism and review', 'A permitted exception, with acknowledgement.'], ['Making a parody video of a film trailer', 'Allowed: parody, caricature and pastiche', 'An exception since 2014.'], ['Copying a chapter for your own non-commercial private study', 'Allowed: research and private study', 'Non-commercial study is an exception.'],
        ['Scanning a whole textbook and selling the PDF', 'Not allowed: infringement', 'Commercial copying of a whole work is not an exception.'], ['Uploading a full film so friends can watch it', 'Not allowed: infringement', 'Distribution without permission.']], 'Is this use allowed without permission under UK copyright law?<br><b>%s</b>', ['Allowed: criticism and review', 'Allowed: parody, caricature and pastiche', 'Allowed: research and private study', 'Not allowed: infringement'], { src: S(W3, 'parody') });
    }],
    ['Free software', function () {
      const r = R.pick([['the freedom to run the program for any purpose', 'Freedom 0'], ['the freedom to study how the program works and change it', 'Freedom 1'], ['the freedom to redistribute copies', 'Freedom 2'], ['the freedom to distribute your modified versions', 'Freedom 3']]);
      if (R.chance(0.3)) return P.mcq('Richard Stallman says free software is “free as in free speech, not free beer”. What does he mean?', 'Free means the user’s freedoms to run, study, share and change it, not that it costs nothing', ['Free software must always be given away at no charge', 'Free software has no copyright', 'Anyone may put their name on free software'], 'Copyleft uses copyright itself to keep those four freedoms attached to every copy.', { src: S(W3, 'free speech') });
      return P.mcq('Which of the four freedoms of free software is <b>' + r[0] + '</b>?', r[1], ['Freedom 0', 'Freedom 1', 'Freedom 2', 'Freedom 3'].filter(function (x) { return x !== r[1]; }), 'Freedom 0 run, 1 study and change (needs the source), 2 redistribute, 3 distribute modified versions.', { src: S(W3, 'freedom') });
    }],
    ['Essay skills: AI and copyright', function () {
      return essay('Should training an AI model on copyrighted news articles count as fair use? Use The New York Times v. OpenAI and Microsoft.', 'Thesis: training should not automatically be fair use when outputs can substitute for the original. Evidence: the Times alleges training infringement, output infringement, DMCA violations and unjust enrichment; defendants say training is transformative. In March 2025 the judge refused to dismiss the core claims. Analysis: “transformative” is strongest when outputs do not compete with the source; regurgitated articles do. Counter: models learn patterns, not copies, and licensing every text could entrench big firms. Conclusion: licensing or opt-outs for commercial training, with exceptions for research.', { src: S(W3, 'New York Times') });
    }]
  ]);

  /* ===== Week 4: computer misuse ===== */
  P.week('spi', 4, 'Computer misuse', { lessons: ['spi-misuse'] }, [
    ['Computer Misuse Act 1990', function () {
      const who = R.pick(WHO), org = R.pick(ORG);
      return P.cls([[who + ' guesses a colleague’s password at ' + org + ' and reads their emails “just to see if it works”', 'Section 1: unauthorised access', 'Knowingly causing a computer to give access that is not authorised. No further intent is needed.'],
        [who + ' logs in to ' + org + '’s payroll system with a stolen password, intending to pay money into their own account', 'Section 2: unauthorised access with intent to commit a further offence', 'A section 1 offence plus intent to commit another crime (here, fraud).'],
        [who + ' installs ransomware that encrypts ' + org + '’s files', 'Section 3: unauthorised modification', 'An act that changes data without authority, with intent.'],
        [who + ' deletes records from ' + org + '’s database after being sacked, using an old login', 'Section 3: unauthorised modification', 'Unauthorised modification (and access) with intent.'],
        [who + ' tests ' + org + '’s servers for weaknesses under a signed contract with the security team', 'No offence under the Act: the access is authorised', 'Authorisation is the key word in every section; ethical hacking with permission is legal.']],
        'Which offence, if any, under the Computer Misuse Act 1990?<br><b>%s</b>', ['Section 1: unauthorised access', 'Section 2: unauthorised access with intent to commit a further offence', 'Section 3: unauthorised modification', 'No offence under the Act: the access is authorised'], { src: S(W4, 'Computer Misuse Act') });
    }],
    ['Why the Act was needed', function () {
      const r = R.pick([['Why did the UK pass the Computer Misuse Act in 1990?', 'Robert Schifreen hacked BT’s Prestel in 1984 and his forgery conviction was overturned on appeal, exposing a gap in the law', ['The ILOVEYOU worm caused $15 billion of damage', 'GDPR required it', 'Hacking was already illegal but penalties were too low'], 'Existing law (forgery) did not fit hacking, so a specific offence was created.'],
        ['The creator of ILOVEYOU (2000) was never prosecuted. Why?', 'The Philippines had no law against it at the time', ['He was never identified', 'The worm caused no damage', 'He had permission from the victims'], 'A law must exist before the act. The same gap led to the UK’s 1990 Act.'],
        ['Under RIPA 2000 Part III, what can happen if you refuse to give the police your encryption keys or passwords?', 'Up to two years in prison', ['Nothing: you have a right to silence', 'A fine only', 'Your devices are automatically wiped'], 'Police used it to jail the prime suspect in the Lucy McHugh case.']]);
      return P.mcq(r[0], r[1], r[2], r[3], { src: S(W4, 'Schifreen') });
    }],
    ['Malware and attacks', function () {
      return P.cls([['attaches itself to a genuine file and spreads when that file is run (Melissa)', 'Virus', 'It needs a host file.'], ['copies itself across networks with no host file (ILOVEYOU, Mydoom, Conficker)', 'Worm', 'Standalone and self-replicating.'], ['looks like a useful app but hides a malicious part', 'Trojan horse', 'It relies on the user installing it.'],
        ['lets an attacker get back in later, bypassing normal security (NetBus, Back Orifice)', 'Backdoor', 'Hidden later access.'], ['encrypts your files and demands payment for the key', 'Ransomware', 'Extortion.'], ['an email designed to trick the reader into revealing a password', 'Phishing', 'A form of social engineering; one preceded the 2013 Associated Press Twitter hack.']],
        'What is software or an attack that <b>%s</b>?', ['Virus', 'Worm', 'Trojan horse', 'Backdoor', 'Ransomware', 'Phishing'], { src: S(W4, 'Worm') });
    }],
    ['Hackers and their hats', function () {
      return P.cls([['breaks in to exploit systems for malicious reasons', 'Black hat', 'Criminal.'], ['finds vulnerabilities to help the owner fix them, with permission', 'White hat (ethical)', 'Authorised testing.'], ['breaks in without permission but not for personal gain, then reports the hole', 'Grey hat', 'Between the two: still unauthorised access.'],
        ['hacks to make a political or social point, like Anonymous', 'Hacktivist', 'Hacking for a cause.'], ['attacks another nation’s vital systems through espionage and sabotage', 'Cyberwarfare', 'State-level attack.']], 'What do you call someone, or an activity, that <b>%s</b>?', ['Black hat', 'White hat (ethical)', 'Grey hat', 'Hacktivist', 'Cyberwarfare'], { src: S(W4, 'hat') });
    }],
    ['Authentication or authorisation?', function () {
      return P.cls([['Entering a password to log in', 'Authentication', 'Proving who you are with something you know.'], ['Tapping a swipe card and typing a PIN at the door', 'Authentication', 'Something you have plus something you know.'], ['A policy that interns may read but not edit the payroll files', 'Authorisation', 'What an identified principal may do.'],
        ['The system refusing a logged-in student access to the marks database', 'Authorisation', 'Identity is known; permission is denied.'], ['Checking a fingerprint on a phone', 'Authentication', 'Something you are.']], 'Is this authentication or authorisation?<br><b>%s</b>', ['Authentication', 'Authorisation'], { src: S(W4, 'Authorisation') });
    }],
    ['Essay skills: law and hacking', function () {
      return essay('Should grey-hat hacking (unauthorised, but done to expose security holes) be treated as a crime?', 'Thesis: it should stay illegal under the Computer Misuse Act, with safe-harbour routes such as bug-bounty programmes. Evidence: section 1 needs no harmful intent; grey hats are “not for personal gain”; bug bounties (e.g. the EU’s FOSSA) reward disclosure with permission. Analysis: owners cannot tell a grey hat from a black hat during an intrusion, and testing can break systems. Counter: prosecuting good-faith researchers discourages disclosure and leaves holes open. Conclusion: authorisation by default, with legal protection for responsible disclosure.', { src: S(W4, 'grey') });
    }]
  ]);

  /* ===== Week 5: software contracts and liability ===== */
  P.week('spi', 5, 'Software contracts and liability', { lessons: ['spi-contracts'] }, [
    ['Which contract clause?', function () {
      return P.cls([['The supplier promises to cover the client if someone sues claiming the software infringes their patent', 'Indemnity', 'One party protects the other from legal consequences.'], ['The software “will operate substantially in accordance with the specifications” for 12 months, with bug fixes', 'Warranty and maintenance', 'Service after delivery.'],
        ['Both sides name a project manager and meet every fortnight', 'Project control', 'How the work is managed.'], ['The client must supply test data and approve each prototype within a week', 'Client’s responsibilities', 'Agile methods depend on this involvement.'], ['A dispute about whether a feature was in scope goes to an independent expert before court', 'Arbitration procedures', 'How disputes are resolved.'],
        ['Either side may end the contract if the other misses three milestones', 'Termination criteria', 'When the contract can end.'], ['Neither side may reveal the other’s business plans', 'Confidentiality', 'Often backed by NDAs.'], ['The software house keeps the copyright and licenses the software to the client', 'Copyright ownership', 'The alternative is assignment to the client on completion.']],
        'Which clause of a software development contract covers this?<br><b>%s</b>', ['Indemnity', 'Warranty and maintenance', 'Project control', 'Client’s responsibilities', 'Arbitration procedures', 'Termination criteria', 'Confidentiality', 'Copyright ownership'], { src: S(W5, 'Indemnity') });
    }],
    ['Scope change or scope creep?', function () {
      return P.cls([['The client asks to drop the chat feature and agrees a new price and deadline', 'Scope change', 'A controlled change to what will be delivered.'], ['Each sprint, small “quick extras” are added with no change to budget or timeline', 'Scope creep', 'Uncontrolled growth during development.'],
        ['Denver airport switched to one baggage system for all airlines without moving the deadline', 'Scope creep', 'A huge change absorbed without adjusting time or risk: United abandoned the system after ten years.'], ['An error in the original specification is corrected by formal agreement', 'Scope change', 'Expected, and handled through the contract.']], 'Scope change or scope creep?<br><b>%s</b>', ['Scope change', 'Scope creep'], { src: S(W5, 'creep') });
    }],
    ['Liability', function () {
      return P.cls([['A manufacturer is responsible for injuries from a defective product, whether or not it was careless', 'Strict liability', 'Regardless of negligence or intent.'], ['A developer skipped normal testing practice and the bug caused a loss', 'Negligence', 'Failing to do what a reasonable person would do.'], ['The software is not fit for the purpose it was sold for', 'Breach of warranty', 'Failing to meet a quality standard.']], 'Which basis for a claim fits?<br><b>%s</b>', ['Strict liability', 'Negligence', 'Breach of warranty'], { src: S(W5, 'Strict liability') });
    }],
    ['Which UK law?', function () {
      return P.cls([['Goods must be fit for purpose', 'Sale and Supply of Goods Act 1994', 'Covers goods.'], ['A service must be carried out with reasonable skill and care', 'Supply of Goods and Services Act 1982', 'Covers services.'], ['A claim needs a duty of care to exist', 'The law of negligence', 'Common law.']], 'Which law does this come from?<br><b>%s</b>', ['Sale and Supply of Goods Act 1994', 'Supply of Goods and Services Act 1982', 'The law of negligence'], { src: S(W5, '1994') });
    }],
    ['Case studies', function () {
      const r = R.pick([['Which is true of the Post Office Horizon scandal?', 'Between 2000 and 2014, 734 sub-postmasters were prosecuted on Horizon evidence', ['Fujitsu’s contract was worth £1 million', 'The first convictions were quashed in 2011', 'Horizon ran in 1,800 branches'], 'Fujitsu’s £1bn contract; rolled out to 18,000 branches from 1999; about one prosecution a week; first convictions quashed in 2021.'],
        ['What went wrong with the Boeing 737 MAX’s MCAS software?', 'It pushed the nose down based on sensor data, and pilots were not told about it because the plane was sold as needing no new training', ['It was never tested on a real plane', 'It was written in an unsafe language', 'It was disabled by the airlines'], 'Underestimated risk plus a commercial promise of no extra training.'],
        ['Why is software not like building a bridge, according to the lecture?', 'Coding and unit testing are only about 15% of the cost; design, integration and system testing are the other 85%', ['Software has no design phase', 'Bridges are cheaper to change', 'Software has no safety risk'], 'In civil engineering design is about 10% and construction 90%.']]);
      return P.mcq(r[0], r[1], r[2], r[3], { src: S(W5, 'Horizon') });
    }],
    ['Essay skills: who is liable?', function () {
      return essay('Who should be held responsible when software failures harm people? Use the Horizon scandal.', 'Thesis: responsibility is shared, but the party with the most knowledge and power, here the supplier and the client who relied on its evidence, carries most. Evidence: Horizon’s synchronisation bugs and unreliable logs; 734 prosecutions 2000–2014; first convictions quashed 2021. Analysis: the Post Office treated software output as proof; duty of care and negligence apply to both. Counter: contracts and licences exclude liability, and users accepted the system. Conclusion: exclusion clauses should not shield suppliers when people are harmed.', { src: S(W5, 'Horizon') });
    }]
  ]);

  /* ===== Week 7: professional issues and ethics ===== */
  P.week('spi', 7, 'Professional issues and ethics', { lessons: ['spi-professional'] }, [
    ['Which ethical theory?', function () {
      const sc = R.pick(['cutting testing to hit a launch date', 'designing an app to be addictive', 'charging .com visitors 30% more than .co.uk visitors', 'reporting a colleague who fakes test results']);
      return P.cls([['“If more people benefit than are harmed, it is right.”', 'Consequentialist (utilitarian)', 'Judges by outcomes: the amount of good produced.'], ['“Lying to customers is wrong whatever the result.”', 'Non-consequentialist (Kantian / deontological)', 'Judges the act itself.'],
        ['“Only do it if you would accept everyone doing it.”', 'Non-consequentialist (Kantian / deontological)', 'Kant’s universal law.'], ['“Weigh the profit against the harm to users and choose the better total.”', 'Consequentialist (utilitarian)', 'Adds up consequences.'], ['“People must never be used merely as a means to an end.”', 'Non-consequentialist (Kantian / deontological)', 'Kant’s respect for persons.']],
        'On ' + sc + ', which kind of moral theory does this reasoning use?<br><b>%s</b>', ['Consequentialist (utilitarian)', 'Non-consequentialist (Kantian / deontological)'], { src: S(W7, 'consequen') });
    }],
    ['Moral principles', function () {
      return P.cls([['A health algorithm gives Black patients lower risk scores than equally sick White patients', 'Breaks the impartiality principle', 'Obermeyer et al. (2019): it predicted costs, and less had been spent on Black patients.'], ['A manager says cutting corners is fine for his team but wrong for a rival team in the same situation', 'Breaks the universalizability principle', 'The same act in relevantly similar situations must get the same verdict.'],
        ['A society’s actual code of conduct, described as it is', 'Descriptive morality', 'What a group does accept.'], ['A code that all rational people would put forward', 'Normative morality', 'What everyone should accept.']], 'Which idea does this show?<br><b>%s</b>', ['Breaks the impartiality principle', 'Breaks the universalizability principle', 'Descriptive morality', 'Normative morality'], { src: S(W7, 'Impartiality') });
    }],
    ['The BCS Code of Conduct', function () {
      const who = R.pick(WHO);
      return P.cls([[who + ' refuses to build a feature that would collect users’ location without consent', 'Public interest', 'Regard for privacy, security and wellbeing.'], [who + ' declines a contract for safety software they have no training in', 'Professional competence and integrity', 'Only take on work you are competent to do.'],
        [who + ' tells the client they own shares in the supplier they are recommending', 'Duty to relevant authority', 'Avoid, or declare, conflicts of interest.'], [who + ' keeps a client’s business plans confidential after leaving the job', 'Duty to relevant authority', 'Respect confidentiality.'], [who + ' mentors junior developers and reports a member who brings the profession into disrepute', 'Duty to the profession', 'Uphold the profession’s reputation and support members.'],
        [who + ' makes sure the system works for disabled users and does not discriminate', 'Public interest', 'Rights of third parties, without discrimination.'], [who + ' does not claim on a CV to know “MOVA”', 'Professional competence and integrity', 'Never claim competence you lack (MOVA does not exist: it was invented to catch liars).']],
        'Which principle of the BCS Code of Conduct does this follow?<br><b>%s</b>', ['Public interest', 'Professional competence and integrity', 'Duty to relevant authority', 'Duty to the profession'], { src: S(W7, 'BCS') });
    }],
    ['Professional dilemmas', function () {
      const r = R.pick([['Three BART engineers in California raised safety problems; management dismissed them and they lost their jobs. Which dilemma is this?', 'Whether to delay or speak up about an unsafe product (whistleblowing)', ['Claiming experience you do not have', 'Sharing copyrighted material', 'Disclosing a conflict of interest'], 'The public-interest duty can conflict with loyalty to the employer.'],
        ['Frances Haugen revealed conflicts between what was good for the public and what was good for Facebook. Which issue is central?', 'Conflict of interest, and whether to disclose it', ['Software piracy', 'Claiming competence you lack', 'Scope creep'], 'Duty to relevant authority versus the public interest.'],
        ['Why does the lecture say ethics matters especially in computing?', 'IT professionals have great knowledge others cannot easily check, and great reach others cannot easily avoid', ['Computing has more laws than other professions', 'Software never fails', 'Users read all the code they use'], 'Users trust software like they trust a bridge, but software is global and instant.']]);
      return P.mcq(r[0], r[1], r[2], r[3], { src: S(W7, 'BART') });
    }],
    ['Essay skills: apply two theories', function () {
      const sc = R.pick(['A client asks you to design their app to be as addictive as possible.', 'Your manager asks you to skip the last week of testing to launch on time.', 'A client wants the website to charge .com visitors 30% more than .co.uk visitors.', 'You find that a colleague has been faking test results.']);
      return P.written(sc + ' Analyse what you should do using utilitarianism and Kantian ethics, and the BCS Code of Conduct.', 8,
        ['States the dilemma and who is affected (1)', 'Utilitarian analysis: weighs benefits and harms for all affected, reaches a verdict (2)', 'Kantian analysis: universal law and/or treating people as ends, reaches a verdict (2)', 'Applies a specific BCS principle correctly (public interest, competence and integrity, duty to relevant authority or to the profession) (2)', 'A justified recommendation (1)'],
        'Name the stakeholders (users, client, you, the profession). A utilitarian adds up consequences: short-term profit versus harm to users, reputation and trust. A Kantian asks whether you could will the act as a universal law and whether users are used merely as a means. The BCS Code’s public-interest principle (wellbeing, privacy) and integrity principle usually point the same way. Recommend a course, such as raising the concern in writing and proposing an ethical alternative, and justify it.', { essay: true, src: S(W7, 'Kant') });
    }]
  ]);

  /* ===== Week 8: technology, its critics and its environmental cost ===== */
  P.week('spi', 8, 'Technology, its critics and its environmental cost', { lessons: ['spi-social-1'] }, [
    ['Assisted, augmented or autonomous?', function () {
      return P.cls([['A radiology tool highlights possible tumours; the doctor decides', 'Assisted intelligence', 'AI helps, people decide.'], ['A designer and a generative model iterate together on a layout, each extending the other', 'Augmented intelligence', 'People and AI decide together.'], ['A trading system buys and sells shares with no human sign-off', 'Autonomous AI', 'The system decides and acts.'],
        ['A spell-checker underlines words; you choose whether to change them', 'Assisted intelligence', 'People decide.'], ['A self-driving shuttle chooses its route and brakes by itself', 'Autonomous AI', 'Acts alone.']], 'Which flavour of AI decision-making is this?<br><b>%s</b>', ['Assisted intelligence', 'Augmented intelligence', 'Autonomous AI'], { src: S(W8, 'Augmented') });
    }],
    ['Neo-Luddite fears', function () {
      return P.cls([['Automation risk is highest in low-paid, less-educated jobs', 'Unemployment', 'Bloomberg’s 2017 job-risk chart.'], ['Products are designed to have a limited useful life, piling up e-waste', 'Manufactured needs', 'Planned obsolescence.'], ['Students in low-income households are far more likely to have no computer at home', 'Social inequity', 'The digital divide in education.'],
        ['The mere presence of a phone can lower the quality of a conversation', 'Social disintegration', 'Misra et al. (2016).'], ['Platforms gather huge amounts of data about us and an “always on” culture spreads', 'Benefits to big business and government', 'Power shifts to data holders.'], ['Echo chambers and computer-led schooling may narrow what people learn', 'An ominous uniformity of knowledge', 'The sixth fear.']],
        'Which neo-Luddite fear does this evidence support?<br><b>%s</b>', ['Unemployment', 'Manufactured needs', 'Social inequity', 'Social disintegration', 'Benefits to big business and government', 'An ominous uniformity of knowledge'], { src: S(W8, 'Luddite') });
    }],
    ['Data centres and PUE', function () {
      const it = R.int(200, 900) * 10, tot = Math.round(it * (1 + R.int(10, 120) / 100));
      if (R.chance(0.6)) return P.num('A data centre uses ' + tot.toLocaleString('en-GB') + ' MWh a year in total, of which its IT equipment uses ' + it.toLocaleString('en-GB') + ' MWh. What is its PUE?', tot / it, 2, 'PUE = total facility energy ÷ IT equipment energy = ' + tot + ' / ' + it + ' = ' + f(tot / it, 3) + '. A perfect centre scores 1.0; the rest goes on cooling, lighting and power losses.', { src: S(W8, 'PUE') });
      const r = R.pick([['About what share of greenhouse emissions does ICT contribute (Freitag et al., 2021)?', 'Around 3–4%', ['Around 0.3%', 'Around 15%', 'Around 40%'], 'ICT used 4–6% of the world’s electricity in 2020; energy-efficient ICT could cut its consumption by 50% by 2030.'],
        ['Roughly how much CO₂ is emitted making one new smartphone?', '40–80 kg', ['0.4–0.8 kg', '400–800 kg', '4–8 tonnes'], 'Most of a phone’s footprint comes from making it, which is why longer device lifetimes matter.'],
        ['What does the Paris Agreement aim for?', 'Warming well below 2 °C above pre-industrial levels, pursuing 1.5 °C', ['Zero emissions by 2025', 'Warming below 4 °C', 'Halving ICT emissions by 2030'], 'The Earth is already about 1.1 °C warmer than in the late 1800s.']]);
      return P.mcq(r[0], r[1], r[2], r[3], { src: S(W8, 'Paris') });
    }],
    ['Tests and the singularity', function () {
      return P.cls([['asks whether a machine’s conversation can pass for a human’s', 'The Turing test', 'Imitation as a test of intelligence.'], ['lets a computer check whether you are human', 'A CAPTCHA', 'A reversed Turing test.'], ['a point where technology advances beyond our understanding and becomes uncontrollable and irreversible', 'The technological singularity', 'The fear behind the open letter signed by Musk, Hawking and others.'], ['a machine as intelligent, creative and self-aware as humans, which has never been built', 'An artificial brain', 'Distinct from today’s narrow AI.']], 'Which idea <b>%s</b>?', ['The Turing test', 'A CAPTCHA', 'The technological singularity', 'An artificial brain'], { src: S(W8, 'Turing') });
    }],
    ['Essay skills: should we fear technology?', function () {
      return essay('“We should limit how far AI advances.” Discuss, using the neo-Luddite fears.', 'Thesis: limit specific uses through regulation rather than limiting advance itself. Evidence: unemployment risk concentrated in low-paid jobs (Bloomberg 2017); manufactured needs and e-waste; data concentration in big business. Analysis: each harm comes from how technology is deployed, which policy can shape (data-protection law, right to repair). Counter: the singularity worry says some risks are irreversible, so caution about advance itself is rational. Conclusion: targeted limits plus investment in people displaced.', { src: S(W8, 'singularity') });
    }]
  ]);

  /* ===== Week 9: social issues online and offline ===== */
  const RISK = { '-1': 11.9, '0': 26.9, '1': 50.0, '2': 73.1, '3': 88.1, '4': 95.3 };
  P.week('spi', 9, 'Data, misinformation and algorithms in society', { lessons: ['spi-social-2'] }, [
    ['Normalisation or stratification?', function () {
      return P.cls([['The richest group adopts first, then the middle, then the poorest, and eventually all use it equally', 'Normalisation model', 'Gaps close over time.'], ['The richest group adopts first and stays ahead of the others for good', 'Stratification model', 'Gaps persist.'], ['A few top performers take a disproportionate share of a market, as in mobile phones', 'Winner-take-all', 'An oligopoly.'], ['Some people have access to modern IT and others do not, and cost is not the only reason', 'The digital divide', 'Ease of use and culture matter too.']], 'Which idea describes this?<br><b>%s</b>', ['Normalisation model', 'Stratification model', 'Winner-take-all', 'The digital divide'], { src: S(W9, 'normalisation') });
    }],
    ['Misinformation and bubbles', function () {
      return P.cls([['False information shared by someone who believes it', 'Misinformation', 'No intention to deceive.'], ['False information spread deliberately to deceive', 'Disinformation', 'Much fake news (Lazer et al., 2018).'], ['A feed shows you only news like what you clicked before', 'A filter bubble', 'Isolation from algorithmic personalisation.'],
        ['A group that distrusts and excludes everyone outside it', 'An echo chamber', 'Outsiders are actively discredited.'], ['A video in which one person’s face is convincingly replaced by another’s', 'A deepfake', 'Synthetic media.']], 'Which term fits?<br><b>%s</b>', ['Misinformation', 'Disinformation', 'A filter bubble', 'An echo chamber', 'A deepfake'], { src: S(W9, 'filter bubble') });
    }],
    ['Interpretable risk scores', function () {
      const pa = R.int(0, 8), lo = R.int(0, 2), age = R.int(18, 60);
      const pts = (pa >= 2 ? 1 : 0) + (pa >= 5 ? 1 : 0) + (lo > 0 ? 1 : 0) + (age >= 18 && age <= 24 ? 1 : 0) - (age >= 40 ? 1 : 0);
      return P.num('Rudin’s scoring system from your slides: +1 if prior arrests ≥ 2, +1 if prior arrests ≥ 5, +1 for any prior arrest for a local ordinance, +1 if age at release is 18–24, −1 if age at release ≥ 40. Scores −1 to 4 map to risks 11.9%, 26.9%, 50.0%, 73.1%, 88.1%, 95.3%. A person has ' + pa + ' prior arrests, ' + lo + ' for local ordinances, and is ' + age + ' at release. What risk (%) does the system give?', RISK[String(pts)], 1,
        'Points: ' + [pa >= 2 ? '+1 (≥ 2 arrests)' : '', pa >= 5 ? '+1 (≥ 5 arrests)' : '', lo > 0 ? '+1 (local ordinance)' : '', age <= 24 ? '+1 (age 18–24)' : '', age >= 40 ? '−1 (age ≥ 40)' : ''].filter(Boolean).join(', ') + (pts === 0 && pa < 2 && !lo && age > 24 && age < 40 ? 'none' : '') + ' → total ' + pts + ' → ' + RISK[String(pts)] + '% (risk = logistic(points − 1)). Anyone can check this by hand, unlike COMPAS with its 180+ hidden factors.', { src: S(W9, 'Prior arrests') });
    }],
    ['Bias in algorithms', function () {
      const r = R.pick([['A US health algorithm chose patients for extra care by predicted cost. What went wrong?', 'Cost is not need: less had been spent on equally sick Black patients, so 18% of those selected were Black instead of 46.5%', ['It used race as a feature directly', 'It was trained on too little data', 'It predicted need correctly but doctors ignored it'], 'Obermeyer et al. (2019): a proxy target carried historical bias.'],
        ['What did ProPublica find about COMPAS?', 'It wrongly labelled Black defendants as future criminals at almost twice the rate of white defendants', ['It was more accurate for Black defendants', 'It used fewer than 10 factors', 'It was never used in sentencing'], 'And white defendants were mislabelled as low risk more often.'],
        ['A husky-or-wolf classifier was 80% accurate but relied on snow in the background. What does this illustrate?', 'The alignment problem: the model learned something other than what we meant', ['Overfitting caused by too many layers', 'A deepfake', 'Normalisation of technology'], 'Explainable AI tools can reveal what a model relied on; Rudin argues for interpretable models in high-stakes decisions.'],
        ['About how many people were affected in the Cambridge Analytica case, from roughly 270,000 quiz-takers?', 'Up to 87 million, through a loophole that exposed friends’ data', ['About 270,000', 'About 2.7 million', 'About 870 million'], 'Roughly 320 people for every quiz-taker, without their consent.']]);
      return P.mcq(r[0], r[1], r[2], r[3], { src: S(W9, 'COMPAS') });
    }],
    ['Judging a computer model', function () {
      return P.written('“All models are wrong, but some are useful” (George Box). Explain what this means and give the three questions the lecture says to ask about any computer model.', 5,
        ['Models simplify reality, so none is exactly right (1)', 'A model can still predict well enough to help decisions (1)', 'How well do the modellers understand the underlying science or theory? (1)', 'What assumptions and simplifications does it make? (1)', 'How closely do its predictions match real experience? (1)'],
        'Every model leaves things out, so it is never exactly true, but it can still be useful if its predictions are good enough for the decision. Ask: how well do the modellers understand the system’s science; what assumptions and simplifications are built in; and how closely have its predictions matched what actually happened?', { essay: true, src: S(W9, 'All models are wrong') });
    }],
    ['Essay skills: algorithms and society', function () {
      const T = R.pick([['Should black-box algorithms be used for high-stakes decisions about people?', 'Thesis: no; use interpretable models (Rudin 2019). Evidence: COMPAS uses 180+ hidden factors and ProPublica found error rates twice as high for Black defendants; a simple points system performs comparably and anyone can check it. Analysis: when decisions affect liberty or health, people need to contest them, which needs reasons. Counter: complex models can be more accurate, and explainable-AI tools can open them up. Conclusion: interpretable by default; black boxes only with evidence they are both better and fair.'],
        ['Should social media platforms be responsible for misinformation on them?', 'Thesis: yes, for what they amplify. Evidence: misinformation and disinformation spread fast (Lazer et al., 2018); filter bubbles come from platform ranking; Cambridge Analytica exploited an API loophole affecting up to 87 million people. Analysis: ranking is an editorial choice, so platforms share responsibility for its effects. Counter: fact-checking at scale risks censorship and errors. Conclusion: transparency and moderation of amplified content, with appeal routes.']]);
      return essay(T[0], T[1], { src: S(W9, 'Cambridge Analytica') });
    }]
  ]);
})();
