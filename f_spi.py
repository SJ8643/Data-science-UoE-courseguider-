from dsl import *

# ---------------------------------------------------------------- 1
lesson('spi-history', 'spi', 'Module overview and the history of computing', 30,
  'ECM1407 Week 1 lecture (Module Overview, History of Computing)',
  ['history of computing', 'Babbage', 'Lovelace', 'difference engine', 'analytical engine', 'Boole', 'Shannon', 'vacuum tube',
   'transistor', 'integrated circuit', 'microprocessor', 'generation', 'UNIVAC', 'IBM', 'assessment', 'essay', 'presentation'],
  ['Know how ECM1407 is assessed and what each week covers',
   'Trace computing from mechanical calculators to the microprocessor',
   'Explain why Babbage and Lovelace matter: the machine versus the program',
   'Name the key technology of each generation of electronic computers'],
  [
    text('''<p><b>How the module works.</b> A two-hour lecture on Mondays (16:35–18:25) plus tutorials. Assessment: an <b>individual essay</b> worth 80% (2,000 words, written in LaTeX, Overleaf template provided, due <b>7 December 2026</b>) and a <b>group presentation</b> worth 20% (a 15-minute video on a social or professional issue of the information age, due 19 October 2026). Turnitin checks for plagiarism.</p>
    <table class="tbl"><tr><th>Week</th><th>Topic</th></tr>
    <tr><td>1</td><td>Module overview, history of computing</td></tr><tr><td>2</td><td>Security, cryptography and society</td></tr>
    <tr><td>3</td><td>Intellectual property</td></tr><tr><td>4</td><td>Computer misuse</td></tr><tr><td>5</td><td>Software contracts</td></tr>
    <tr><td>6</td><td>Reading week</td></tr><tr><td>7</td><td>Professional issues</td></tr>
    <tr><td>8</td><td>Social issues I: AI and robotics, fear of technology</td></tr><tr><td>9</td><td>Social issues II: misinformation, inequality, bias, climate</td></tr>
    <tr><td>10</td><td>Data protection: Data Protection Act, GDPR, the right to be forgotten</td></tr><tr><td>11</td><td>AR, VR and HCI technologies</td></tr></table>
    <p>This section covers the lectures in your folder so far: weeks 1–5 and 7. Every lesson ends with an essay-style practice question.</p>'''),
    prime('Who is often described as the first computer programmer?', ['Charles Babbage', 'Ada Lovelace', 'George Boole', 'Claude Shannon'], 1,
          'In 1843 Lovelace published notes on Babbage’s Analytical Engine, including Note G: a method for the engine to compute Bernoulli numbers.'),
    key('''<table class="tbl"><tr><th>When</th><th>What</th><th>Why it matters</th></tr>
    <tr><td>1000–500 BC</td><td>Abacus</td><td>counting aid</td></tr>
    <tr><td>~100 BC</td><td>Antikythera mechanism</td><td>the oldest known example of an analogue computer</td></tr>
    <tr><td>1623</td><td>Wilhelm Schickard’s calculator</td><td>first automatic mechanical calculator: adds and subtracts 6-digit numbers</td></tr>
    <tr><td>1670s</td><td>Leibniz’s calculating machine</td><td>could also multiply and divide (your slide says ~1640, but Leibniz was born in 1646)</td></tr>
    <tr><td>1821–22</td><td>Babbage: “I wish to God these calculations had been executed by steam!”; announces the Difference Engine</td><td>mechanising whole tables of calculations</td></tr>
    <tr><td>1823–34</td><td>Government funding (£1,700), toolmaker Joseph Clement; prototype in 1832; construction halted in 1834</td><td></td></tr>
    <tr><td>1837</td><td>Analytical Engine: input, <b>store</b> (≈ memory), <b>mill</b> (≈ CPU), output</td><td>design for a general-purpose programmable machine</td></tr>
    <tr><td>1843</td><td>Ada Lovelace’s notes, including Note G</td><td>from the machine to the program</td></tr>
    <tr><td>1847</td><td>George Boole’s algebra of logic</td><td>symbols for classes that obey algebraic laws: if x = black and y = sheep, xy is the class of black sheep</td></tr>
    <tr><td>1847–49</td><td>Difference Engine No. 2 designed</td><td></td></tr>
    <tr><td>1936–37</td><td>Claude Shannon’s master’s thesis</td><td>Boolean algebra designs switching circuits: circuit design goes from an art to a science</td></tr></table>'''),
    code('How the Difference Engine computed', '''
        ## The method of differences: a whole table using only addition
        value, d1, d2 = 41, 2, 2           #: f(0) for f(x) = x² + x + 41, its first difference, and the constant second difference.
        for x in range(10):
            print(x, value, value == x * x + x + 41)   #: Check each result against the formula.
            value = value + d1             #: Next value = this value + first difference.
            d1 = d1 + d2                   #: The first difference grows by the second difference.
        ''',
        predict=('The table starts 41, 43, 47. What comes next?', ['49', '51', '53', '55'], 2,
                 'The gaps grow by 2 each time: +2, +4, then +6, giving 53.'),
        investigate=[('Why did this method suit a machine made of gears?', 'Every step is an addition, which turning toothed wheels can do. Babbage never needed mechanical multiplication to tabulate a polynomial.'),
                     ('The slides ask: was the Difference Engine just a calculator? What do `d1` and `d2` show?', 'It mechanised a whole series of calculations, and it stored intermediate values (the differences) for later steps: a first form of storage.')]),
    key('''<p><b>Babbage and Lovelace</b> produced one of computing’s central distinctions: the machine as a physical mechanism, and the program that directs it through a sequence of operations. The question moved from “Can the machine calculate?” to “What can we tell the machine to do?” Lovelace is remembered as a visionary for seeing that.</p>
    <table class="tbl"><tr><th>Generation</th><th>Years</th><th>Key technology</th><th>Landmark</th></tr>
    <tr><td>First</td><td>1950–59</td><td>Vacuum tube (logic gates)</td><td>UNIVAC (1951), first commercial vacuum-tube computer; heat, weight, size and reliability problems</td></tr>
    <tr><td>Second</td><td>1960–68</td><td>Transistor (gates without the tubes’ power use)</td><td>IBM System/360 (1964) introduces the computer family</td></tr>
    <tr><td>Third</td><td>1969–77</td><td>Integrated circuit: smaller, cheaper, more reliable</td><td>Cray-1, the first commercial supercomputer (dated 1975 on the slide)</td></tr>
    <tr><td>Fourth</td><td>1978–2009</td><td>Microprocessor: a whole CPU on one chip (Intel 4004, 1971)</td><td>IBM PC: an open architecture, for everybody</td></tr>
    <tr><td>Fifth</td><td>2010–</td><td>System on a chip (SoC)</td><td>Post-PC era? AI? Cloud?</td></tr></table>
    <p>Shannon plus vacuum tubes gave electronic computers: Boolean logic could now be built from fast electronic switches.</p>'''),
    explain('Essay practice. Explain why Lovelace’s contribution is described as a shift from “Can the machine calculate?” to “What can we tell the machine to do?”',
            'Babbage’s work was about engineering a machine that performs calculations. Lovelace treated the Analytical Engine as something to instruct: her Note G set out a sequence of operations to compute Bernoulli numbers, separate from the hardware. That separation of program from machine is the basis of software, and it is why she is seen as a visionary. She also imagined the engine handling symbols beyond numbers.'),
    quiz(
      mcq('In the Analytical Engine, the “mill” corresponds to the…', ['memory', 'CPU', 'input device', 'printer'], 1, 'The store held numbers (memory); the mill operated on them (processor).'),
      mcq('The key technology of the third generation was…', ['the vacuum tube', 'the transistor', 'the integrated circuit', 'the microprocessor'], 2, 'Integrated circuits made devices smaller, cheaper and more reliable.'),
      mcq('What did Shannon’s 1930s thesis show?', ['How to build vacuum tubes', 'That Boolean algebra can design switching circuits', 'How to program the Analytical Engine', 'How to compress data'], 1, 'It turned circuit design from an art into a science.'),
      mcq('UNIVAC (1951) was…', ['the first microprocessor', 'the first commercial vacuum-tube computer', 'the first supercomputer', 'Babbage’s machine'], 1, 'Its problems were heat, weight, size and reliability.'),
      card('What was Note G?', 'Ada Lovelace’s note showing how the Analytical Engine could calculate Bernoulli numbers. It is often called the first computer program.'),
      card('How is ECM1407 assessed?', 'Individual essay 80% (2,000 words, LaTeX, due 7 December 2026) and group presentation 20% (a 15-minute video).'),
      card('What did the IBM System/360 introduce, and what did the IBM PC stand for?', 'System/360 (1964): the idea of a computer family. IBM PC: an open architecture, for everybody.'),
    ),
  ],
  summary='Module logistics, then computing history from the abacus to the microprocessor, with a working difference engine.',
  decks=['spi-week-01'])

# ---------------------------------------------------------------- 2
lesson('spi-security', 'spi', 'Security, cryptography and society', 45,
  'ECM1407 Week 2 lecture and tutorial (Security, Cryptography and Society)',
  ['security', 'confidentiality', 'authentication', 'integrity', 'availability', 'interruption', 'interception', 'modification',
   'fabrication', 'firewall', 'cryptography', 'encryption', 'cipher', 'Caesar', 'Kerckhoffs', 'key space', 'public key',
   'symmetric', 'RSA', 'end-to-end', 'Snowden', 'PGP', 'Heartbleed'],
  ['Name the four security properties and the four threats that attack them',
   'Explain security as a trade-off: cost–benefit and the weakest link',
   'Explain Kerckhoffs’ principle, key spaces, symmetric and public-key cryptography, and RSA',
   'Argue both sides of the strong-encryption debate'],
  [
    text('''<p>Most of computer science is about making a system do what we want. <b>Security</b> is about stopping it doing what we do not want, while an adversary actively tries to get round every protection. That is a different way of thinking.</p>
    <p>Security is a <b>trade-off</b>: the goal is “as secure as possible within the constraints” (cost, usability, convenience), not “as secure as possible”. A <b>cost–benefit analysis</b> weighs the cost of an attack against its value to the attacker, the cost of damage against the cost of defence, and how likely each attack is. Sometimes the best defence is not being the easiest target. And “more” security is not always better: a system is only as strong as its <b>weakest link</b>, so there is no point raising one fence post if the enemy can walk round it.</p>
    <p>The lecture’s example: someone’s mother’s maiden name can be found in public records. The problem is not that it is public. The problem is using public information to authenticate people. “The system” includes the people and processes around the computer.</p>'''),
    prime('An attacker floods a website so real users cannot reach it. Which security property is under attack?', ['Confidentiality', 'Integrity', 'Availability', 'Authentication'], 2,
          'This is an interruption, or denial-of-service, attack. Nothing is read or changed; the service is simply made unavailable.'),
    key('''<p><b>Four properties of secure communication</b>: <b>confidentiality</b> (only the sender and intended receiver understand the message), <b>authentication</b> (each side confirms who the other is), <b>message integrity</b> (changes in transit, or afterwards, are detected), <b>availability</b> (services stay accessible to authorised users).</p>
    <table class="tbl"><tr><th>Threat</th><th>What the intruder does</th><th>Property attacked</th><th>Also called</th><th>Defences</th></tr>
    <tr><td>Interruption</td><td>degrades or disables a service</td><td>availability</td><td>denial of service (DoS)</td><td>firewalls, replication, backups</td></tr>
    <tr><td>Interception</td><td>eavesdrops on private data</td><td>confidentiality</td><td>snooping</td><td>encryption, traffic padding</td></tr>
    <tr><td>Modification</td><td>tampers with data or resources</td><td>integrity</td><td>man in the middle</td><td>encryption, traffic padding, backups, checksums, sequence numbers, digests, authentication codes</td></tr>
    <tr><td>Fabrication</td><td>inserts counterfeit data or services</td><td>authentication (access control)</td><td>masquerading</td><td>authentication and authorisation, firewalls, digital signatures</td></tr></table>
    <p>Principles you may follow: policy first, access second; deny first, permit only when required; a 100% secure environment is a myth; threats can come from inside; do not forget physical security. A <b>firewall</b> isolates an organisation’s network from the Internet, letting some packets through and blocking others (for example SYN floods: many fake TCP connections that use up the buffers).</p>'''),
    key('''<p><b>Cryptography</b> (“secret writing”): mathematical techniques for securing digital information, systems and computations against adversaries. <b>Caesar’s cipher</b> shifts each letter 3 places. Keeping the method secret is <b>security by obscurity</b>. <b>Kerckhoffs’ principle</b> rejects it: the method must not need to be secret, and must be able to fall into enemy hands safely; only the <b>key</b> is secret. The <b>sufficient key-space principle</b>: there must be too many keys to try them all. A shift cipher has only 26 keys. A mono-alphabetic substitution cipher (any letter-to-letter mapping) has 26! ≈ 2⁸⁸ keys.</p>'''),
    code('A Caesar cipher and a brute-force attack', '''
        def shift(text, k):
            out = ""
            for ch in text:
                if ch.isalpha():
                    base = ord("A") if ch.isupper() else ord("a")
                    out += chr((ord(ch) - base + k) % 26 + base)   #: Move k places along the alphabet, wrapping Z round to A.
                else:
                    out += ch                                      #: Spaces and punctuation stay as they are.
            return out

        secret = shift("Wassup, Brutus?", 3)
        print(secret)                         #: The slide's example.
        for k in range(26):                   #: Brute force: there are only 26 keys to try.
            guess = shift(secret, -k)
            if "Brutus" in guess:
                print("key", k, "->", guess)
        ''',
        predict=('How many keys must an attacker try, at most, to break a shift cipher?', ['3', '26', '26! (about 2⁸⁸)', 'It cannot be broken'], 1,
                 'There are only 26 possible shifts, so trying them all is instant. This is why a sufficient key space matters.'),
        investigate=[('The substitution cipher has 26! keys. Why is it still easy to break?', 'Each letter is always replaced by the same letter, so letter frequencies survive: the most common ciphertext letter is probably E. A big key space is necessary, but not sufficient.'),
                     ('How does this cell illustrate Kerckhoffs’ principle?', 'The attacker knows the method (shift letters) and still needs the key. With only 26 keys the cipher fails, but not because the method was public.')],
        modify=[('ROT13 is a shift of 13. Show that applying it twice gives back the original text.', 'Call `shift` on the result of `shift`.', 'print(shift(shift("Ada Lovelace", 13), 13))')]),
    key('''<p><b>Symmetric-key</b> cryptography: sender and receiver share the same secret key. The problem is agreeing on that key in the first place, especially if they have never met. <b>Public-key</b> cryptography (Diffie–Hellman 1976, RSA 1978) solves it: the encryption key is public, and the decryption key is private, known only to the receiver. It must be impossible to work out the private key from the public one.</p>
    <p>In a <b>man-in-the-middle</b> attack, the attacker sits between sender and receiver and passes on, or alters, what each sends. Both sides receive messages and, because they use encryption, may believe they have confidentiality.</p>
    <p><b>RSA</b>: choose two large primes p and q; compute n = pq and z = (p − 1)(q − 1); choose e &lt; n with no common factor with z; choose d with ed mod z = 1. The public key is (n, e) and the private key is (n, d). Encrypt: c = mᵉ mod n. Decrypt: m = cᵈ mod n.</p>'''),
    code('RSA with the slide’s small numbers', '''
        p, q = 5, 7
        n, z = p * q, (p - 1) * (q - 1)       #: n = 35, z = 24
        e = 5                                 #: e and z = 24 share no common factor.
        d = 29                                #: The slide's choice: e·d − 1 = 144 = 6 × 24, so e·d mod z = 1.
        print("public key:", (n, e), " private key:", (n, d), " e·d mod z =", (e * d) % z)
        m = 12                                #: The letter L, as on the slide.
        c = pow(m, e, n)                      #: Encrypt: c = m^e mod n.
        print("ciphertext:", c)
        print("decrypted:", pow(c, d, n))     #: Decrypt: m = c^d mod n.
        ''',
        predict=('The slide encrypts m = 12 with e = 5 and n = 35. What ciphertext comes out?', ['12', '17', '29', '35'], 1,
                 '12⁵ = 248832, and 248832 mod 35 = 17.'),
        investigate=[('Why is RSA secure with 1024-bit primes but useless with 5 and 7?', 'Anyone can factor 35 into 5 × 7, then compute z and d. RSA relies on there being no efficient way to factor huge numbers. Shor’s algorithm, on a large enough quantum computer, would break it.'),
                     ('Python can find d for you with `pow(e, -1, z)`. Why does that give 5 rather than the slide’s 29?', 'Both work: 5 × 5 = 25 and 5 × 29 = 145 each leave remainder 1 when divided by 24, and pow returns the smallest. With such tiny numbers the private exponent can even equal the public one, another reason real RSA uses huge primes.'),
                     ('What does `pow(c, d, n)` do that `c ** d % n` does not?', 'It reduces modulo n at every step, so the numbers stay small. The slide shows 17²⁹ written out in full: a 36-digit number.')],
        modify=[('Check that decrypting the encryption returns every message m from 0 to 34.', 'Use `all(...)` over `range(n)`.', 'print(all(pow(pow(m, e, n), d, n) == m for m in range(n)))')]),
    key('''<p><b>Attacks on cryptosystems</b>: brute force, differential cryptanalysis, <b>side-channel</b> attacks (timing, power monitoring) and implementation bugs. <b>Heartbleed</b> was a bug in OpenSSL that exposed memory on servers; Yahoo!, Imgur, Stack Overflow and many others were affected, and users of AWS, Reddit, GitHub and more were asked to change their passwords.</p>
    <p><b>Encryption and society.</b> Strong encryption lets good people act without government control, and so does it for bad people. Encryption with keys longer than 40 bits was once on the US Munitions List and could not be exported. In 1991 Phil Zimmermann released PGP (Pretty Good Privacy) on the Web. <b>Zimmermann’s law</b>: technology tends to make surveillance easier, and computers’ ability to track us doubles every eighteen months. Edward Snowden’s leaks revealed programmes such as PRISM, Tempora, MUSCULAR and Stellar Wind. The aftermath was HTTPS almost everywhere and <b>end-to-end encryption</b> (E2EE): messages are encrypted before they leave the device and decrypted only at the destination. Does E2EE hide criminal activity, and is banning it a solution?</p>'''),
    explain('Tutorial question. How could you use a cryptography system to make sure a file really comes from a specific person?',
            'Use a digital signature. The sender computes a digest (hash) of the file and encrypts it with their private key. Anyone can decrypt it with the sender’s public key and compare it with their own digest of the file. A match shows the file came from the holder of the private key (authentication) and was not changed (integrity).'),
    explain('Essay practice. “It is time to put an end to end-to-end encryption.” Give the strongest arguments on both sides.',
            'For limiting E2EE: it can hide terrorism, child abuse and organised crime from lawful investigation, and governments argue that warrants should work online as they do offline. Against: any backdoor for police is a weakness criminals and hostile states can also exploit, which conflicts with Kerckhoffs-style security; E2EE protects journalists, activists and ordinary users, especially in light of the surveillance Snowden exposed; and criminals can still build their own strong encryption, as PGP showed in 1991. A balanced essay weighs security for everyone against access for investigators.'),
    quiz(
      mcq('A “man in the middle” who alters messages in transit attacks…', ['availability', 'integrity', 'confidentiality only', 'nothing, if encryption is used'], 1, 'Modification attacks target message integrity.'),
      mcq('Kerckhoffs’ principle says…', ['keep the algorithm secret', 'the method may be public; only the key must be secret', 'use the longest key possible', 'never use encryption'], 1, 'Security must not depend on hiding the method.'),
      mcq('In public-key cryptography, which key decrypts a message sent to Bob?', ['Bob’s public key', 'Bob’s private key', 'the sender’s private key', 'a shared secret key'], 1, 'Anyone can encrypt with Bob’s public key; only Bob’s private key decrypts.'),
      mcq('What does RSA’s security rest on?', ['Keeping e secret', 'No efficient algorithm for factoring large numbers', 'Using small primes', 'The Caesar shift'], 1, 'Factor n and you can compute the private key.'),
      card('Match the four threats to the property each attacks.', 'Interruption → availability. Interception → confidentiality. Modification → integrity. Fabrication → authentication.'),
      card('Tutorial: which of RAMPART-A, SORM, StingRay and Fairview were revealed by the Snowden leaks?', 'RAMPART-A and Fairview, both NSA programmes for tapping fibre-optic cables. SORM is Russia’s own interception system, and StingRay is a phone-tracking device used by police.'),
      card('What is the sufficient key-space principle?', 'A secure scheme needs a key space too large for an exhaustive search. The shift cipher (26 keys) fails it.'),
      card('Why is security a trade-off?', 'Every protection costs money, usability or convenience. The aim is the best security within those constraints, matched to the likely attacks and the value of what is protected.'),
    ),
  ],
  summary='Security properties and threats, ciphers you can break in code, RSA by hand, and the encryption debate.',
  decks=['spi-week-02', 'spi-tutorial-02'])

# ---------------------------------------------------------------- 3
lesson('spi-ip', 'spi', 'Intellectual property', 40,
  'ECM1407 Week 3 lecture (Intellectual Property)',
  ['intellectual property', 'copyright', 'copyleft', 'open source', 'free software', 'licence', 'license', 'trademark', 'patent',
   'trade secret', 'cybersquatting', 'non-disclosure', 'NDA', 'fair use', 'OpenAI', 'Stallman'],
  ['Distinguish copyright, patents, trademarks and trade secrets',
   'Apply UK copyright rules: automatic protection, exceptions, employment',
   'Explain copyleft and the four freedoms of free software',
   'Discuss the AI copyright cases and patent trolls'],
  [
    text('''<p><b>Intellectual property (IP)</b> is the intangible creative work, not its physical form: any product of the human intellect that has commercial value. A Jackson Pollock canvas cost about £27 of fibreboard and £200 of paint, yet sold for £100 million. Computing threatens IP because copies are easy and perfect: compression, cheap storage, search, peer-to-peer sharing and fast broadband.</p>'''),
    prime('You write a program at home. When does UK copyright protect it?', ['Once you register it', 'Once you add a © symbol', 'Automatically, as soon as you create it', 'Only once you publish it'], 2,
          'Copyright is automatic: no application and no fee. The UK has no copyright register at all.'),
    key('''<table class="tbl"><tr><th></th><th>Copyright</th><th>Patent</th><th>Trademark</th><th>Trade secret</th></tr>
    <tr><td>Protects</td><td>a work (code, text, music), not the idea behind it</td><td>an invention</td><td>a sign (word, logo) that identifies the source of goods or services</td><td>secret information that gives a competitive advantage</td></tr>
    <tr><td>How you get it</td><td>automatically</td><td>apply; the invention must be new, involve an inventive step and be capable of industrial application</td><td>register it</td><td>keep it secret, with reasonable efforts such as NDAs</td></tr>
    <tr><td>How long</td><td>for software and other literary works, usually the author’s life plus 70 years</td><td>20 years, in exchange for disclosing the invention</td><td>as long as it is renewed and used</td><td>as long as it stays secret</td></tr>
    <tr><td>Examples</td><td>your code; a novel</td><td>Amazon 1-Click; RSA</td><td>“Microsoft”</td><td>Coca-Cola’s recipe; WD-40; Google’s search algorithm</td></tr></table>'''),
    key('''<p><b>Copyright</b> lets the owner control how a work is used. You cannot copyright the idea of “a book about a young wizard”, only the book. <b>Exceptions</b> allow use without permission for non-commercial research and private study; criticism, review and reporting current events; teaching; helping disabled people; and parody, caricature and pastiche. The first owner is the author, <b>unless the work is made in the course of employment</b>, when the employer owns it. A freelancer without a contract that assigns copyright keeps it.</p>
    <p><b>Cases</b>: in Field v. Google (US), caching an author’s online story was fair use. In Belgium, Copiepresse won against Google for posting news summaries without permission. Should search engines pay for cached copies?</p>
    <p><b>AI.</b> In The New York Times v. OpenAI and Microsoft, the Times alleges: training infringement (copying millions of articles into training data), output infringement (answers that reproduce or substitute for its articles), a dispute over fair use (defendants say training is transformative; the Times says it is commercial and harmful), a DMCA violation (stripping copyright management information) and unjust enrichment. In March 2025 the judge refused to dismiss the core claims; your slides expected a trial in late 2026. Who owns AI-generated content depends on the user’s input, the AI developer, the terms of service, and whether any human was involved. Practical steps: read the terms of service, keep records of your inputs, consult a legal expert, avoid infringement.</p>'''),
    slip('''<p>“Free software” does not mean free of charge. Richard Stallman: free as in free speech, not free beer.</p>'''),
    key('''<p><b>Copyleft</b> uses copyright to keep software free. The <b>four freedoms</b>: 0, to run the program for any purpose; 1, to study how it works and change it; 2, to redistribute copies; 3, to distribute your modified versions. Linus Torvalds built Linux in this world. In 2001 Microsoft’s CEO Steve Ballmer called Linux “a cancer”; in 2018 Satya Nadella bought GitHub for $7.5 billion and said Microsoft was “all-in on open source”. Is free software sustainable? When Heartbleed hit, OpenSSL had two full-time people for 500,000 lines of business-critical code. Bug-bounty programmes such as the EU’s FOSSA now fund audits.</p>
    <p><b>Trademarks</b> cannot be offensive, describe the goods themselves, be misleading, be a 3D shape associated with the goods, or be too common to be distinctive. Microsoft v. Lindows.com (2001) ended with Lindows renaming itself Linspire. <b>Cybersquatting</b>: registering a domain name to profit from someone else’s trademark (tesla.com sold for $11M, fb.com for $8.5M, ig.com for $4.6M). Facebook lets owners reclaim usernames that infringe trademarks; X forbids selling usernames and non-parody impersonation.</p>
    <p><b>Patents</b> can block progress: <b>gridlocks</b> (overlapping patents that make a product impossible to build without many licences) and <b>trolls</b> (firms that hold patents only to collect fees: Intellectual Ventures holds an estimated 30,000 patents and has collected $2 billion in licence fees). Uber has patented its surge-pricing algorithm.</p>'''),
    explain('Essay practice. Should AI companies need a licence to train models on copyrighted text?',
            'For licensing: training copies whole works without permission, outputs can compete with the originals (the Times’ subscription model), creators lose income and control, and the DMCA claim says copyright information was stripped. Against: training may be transformative, like a person learning by reading; licensing every source could make AI development prohibitively expensive and favour the biggest companies; and copyright protects expression, not the facts and patterns a model learns. A strong essay notes that the courts have not settled this yet, and that the answer may differ between training and outputs.'),
    quiz(
      mcq('A company keeps its recipe secret and makes staff sign NDAs. This is protected as…', ['a patent', 'a trade secret', 'copyright', 'a trademark'], 1, 'Like Coca-Cola and WD-40: protected as long as it stays secret.'),
      mcq('How long does a patent give its owner a monopoly?', ['5 years', '20 years', 'the inventor’s life plus 70 years', 'forever'], 1, 'In return, the inventor must disclose how the invention works.'),
      mcq('Under UK law, who owns the copyright in a computer-generated work with no human author?', ['Nobody', 'The AI itself', 'The person who made the arrangements necessary for its creation', 'The government'], 2, 'Section 9(3) of the Copyright, Designs and Patents Act 1988.'),
      mcq('Which of these was patented?', ['Dijkstra’s algorithm', 'Amazon’s 1-Click ordering', 'The term “Open Source”', 'The Java API'], 1, 'The RSA algorithm was also patented. Dijkstra never patented his algorithm.'),
      card('Name the four freedoms of free software.', '0: run it for any purpose. 1: study and change it. 2: redistribute copies. 3: distribute modified versions.'),
      card('List the UK exceptions to copyright from the lecture.', 'Non-commercial research and private study; criticism, review and news reporting; teaching; helping disabled people; parody, caricature and pastiche.'),
      card('What is cybersquatting?', 'Registering or using a domain name with intent to profit from someone else’s trademark.'),
      card('Patent gridlock vs patent troll?', 'Gridlock: overlapping patents block anyone from building a product. Troll: a firm that buys patents to collect licence fees rather than to make anything.'),
    ),
  ],
  summary='Copyright, copyleft, trademarks, patents and trade secrets, plus the AI copyright fight.',
  decks=['spi-week-03'])

# ---------------------------------------------------------------- 4
lesson('spi-misuse', 'spi', 'Computer misuse', 40,
  'ECM1407 Week 4 lecture (Computer Misuse)',
  ['computer misuse', 'hacker', 'hackers', 'hacking', 'cybercrime', 'virus', 'worm', 'trojan', 'backdoor', 'ransomware', 'phishing',
   'social engineering', 'hacktivism', 'cyberwarfare', 'Computer Misuse Act', 'unauthorised', 'unauthorized', 'authentication', 'authorisation', 'RIPA'],
  ['Describe how “hacker” changed meaning, and the skill levels and hats of hackers',
   'Tell viruses, worms, trojans, backdoors and ransomware apart',
   'Apply the three offences of the Computer Misuse Act 1990',
   'Explain authentication, authorisation and why password length matters'],
  [
    text('''<p><b>“Hacker” has changed meaning</b>. Era 1, the joy of programming: someone who enjoys exploring programmable systems and stretching their capabilities. Era 2: the rise of hacking’s dark side. Era 3: hacking as a destructive, criminal tool, someone who breaks into systems to reach data they should not have. Why is the digital world so vulnerable? Complexity, the impossibility of bug-free software, human nature, and interconnectivity.</p>'''),
    prime('A student finds a flaw and views another student’s records without permission, but changes nothing. Under the Computer Misuse Act 1990…', ['There is no offence, since nothing changed', 'It is the section 1 offence: unauthorised access', 'It is the section 3 offence: unauthorised modification', 'It is only a civil matter'], 1,
          'Section 1 needs only that the access was intended, unauthorised, and known to be unauthorised. Modifying or sharing data is not required.'),
    key('''<p><b>Skill levels</b> (Nosco et al., 2020): those who use existing attack toolkits make the most attacks, but these are the easiest to defend against; those who modify toolkits make more targeted attacks that are harder to defend against; those who create new toolkits are the hardest to stop, often using zero-day vulnerabilities.</p>
    <p><b>Hats</b>: <b>black-hat</b> hackers break in to exploit systems for malicious reasons; <b>white-hat</b> (ethical) hackers find vulnerabilities to help strengthen security; <b>grey-hat</b> hackers move between the two, but not for personal gain.</p>
    <table class="tbl"><tr><th>Tool</th><th>What it is</th><th>Examples from the lecture</th></tr>
    <tr><td>Virus</td><td>attaches to a genuine host file, replicates, acts when activated</td><td>Melissa (~$1.1bn)</td></tr>
    <tr><td>Worm</td><td>standalone, replicates itself with no host file</td><td>ILOVEYOU (~$15bn), Mydoom (~$38bn), Sobig, Code Red, Conficker</td></tr>
    <tr><td>Backdoor</td><td>allows later access, bypassing normal security</td><td>NetBus, Back Orifice</td></tr>
    <tr><td>Trojan horse</td><td>looks like a genuine application but hides a malicious part</td><td>may send spam, install a virus or open a backdoor</td></tr>
    <tr><td>Ransomware</td><td>encrypts your files and demands payment for the key</td><td></td></tr></table>
    <p><b>Social engineering</b> manipulates people into revealing information or weakening security. <b>Phishing</b> is a message designed to trick a victim; a phishing email preceded the 2013 hack of the Associated Press Twitter account. <b>Hacktivism</b> is hacking for political or social goals (Anonymous; LulzSec’s Sony leak, motivated by Sony’s legal action against George Hotz for jailbreaking the PlayStation 3). <b>Cyberwarfare</b> attacks a nation’s computers and vital systems through espionage, sabotage and propaganda.</p>'''),
    key('''<p><b>Responding to hacking.</b> The creator of ILOVEYOU (2000) was never prosecuted: the Philippines had no law against it. In 1984 Robert Schifreen hacked BT’s Prestel service; his conviction under forgery law was overturned on appeal, which exposed the gap the UK filled with the <b>Computer Misuse Act 1990</b>:</p>
    <table class="tbl"><tr><th>Section</th><th>Offence</th><th>Requirements</th><th>Maximum (from your slides)</th></tr>
    <tr><td>1</td><td>Unauthorised access</td><td>causes a computer to perform any function intending to gain access; the access is unauthorised; the person knows it is</td><td>up to 1 year; unlimited fine</td></tr>
    <tr><td>2</td><td>Unauthorised access with ulterior intent</td><td>a section 1 offence committed intending to commit a further offence</td><td>5 years on indictment; unlimited fine</td></tr>
    <tr><td>3</td><td>Unauthorised modification</td><td>any act causing unauthorised modification of material, with the requisite intent and knowledge</td><td>10 years on indictment; unlimited fine</td></tr></table>
    <p>Crime increasingly involves computers: fraud, extortion, theft, catfishing. Under the <b>Regulation of Investigatory Powers Act 2000, Part III</b>, refusing to hand over cryptographic keys or passwords to the police can mean up to two years in prison; police used it to jail the prime suspect in the Lucy McHugh case.</p>'''),
    key('''<p><b>Security measures.</b> <b>Authentication</b> establishes the identity of a principal (a person, process, program, machine or device): “you are who you say you are”. It is based on knowing a secret (a password) or possessing an object (a swipe card), often with a PIN. <b>Authorisation</b>: a policy says which principals may access which services, and how, and mechanisms enforce it. Unchecked software subverts this: a program you download runs with all your access rights, which is why its source should be authenticated. Networked systems add more: the medium is insecure, so security must be consistent end to end. When organisations collaborate, authentication must work across several <b>security realms</b>; the lecture’s multi-party session technique cuts the number of cross-realm authentications from O(n²) to O(n).</p>'''),
    code('Why password length beats password tricks', '''
        def human(seconds):
            for unit, size in [("years", 3.15e7), ("days", 86400), ("hours", 3600), ("minutes", 60)]:
                if seconds >= size:
                    return f"{seconds / size:,.1f} {unit}"
            return f"{seconds:.5f} seconds"

        guesses_per_second = 1e9                    #: Assume an attacker can test a billion guesses per second offline.
        for name, symbols, length in [("4-digit PIN", 10, 4), ("6 lowercase letters", 26, 6), ("8 lowercase letters", 26, 8),
                                      ("8 letters and digits", 62, 8), ("12 letters and digits", 62, 12)]:
            space = symbols ** length                #: Number of possible passwords: symbols to the power of length.
            print(f"{name:22s} {space:>26,d}  {human(space / guesses_per_second)}")
        ''',
        predict=('Which change multiplies the work for an attacker more: 8 → 12 characters, or 26 → 62 symbols at length 8?', ['8 → 12 characters', '26 → 62 symbols', 'They are about the same'], 0,
                 'Length is the exponent: four more characters multiplies the space by 62⁴, about 15 million. Going from 26 to 62 symbols at length 8 multiplies it by (62/26)⁸, about 1,000.'),
        investigate=[('Which week 2 principle is this?', 'The sufficient key-space principle: the space of possible passwords must be too large for an exhaustive search.')]),
    explain('Essay practice. Is “harmless” hacking really harmless?',
            'Arguments that it can be harmless or useful: white-hat and grey-hat hackers expose flaws before criminals find them, bug-bounty programmes reward exactly this, and the original hacker culture was about curiosity and skill. Arguments against: under the Computer Misuse Act, unauthorised access is an offence even with no damage; owners cannot tell a curious intruder from a criminal, so they must respond at real cost; accessing data violates other people’s privacy; and tools and knowledge spread to less careful people. A good answer separates authorised testing (permission, responsible disclosure) from unauthorised access, however well meant.'),
    quiz(
      mcq('A standalone program that copies itself across networks without a host file is a…', ['virus', 'worm', 'trojan horse', 'backdoor'], 1, 'A virus needs a host file; a worm does not.'),
      mcq('A state group steals confidential grid data, then cuts power. Which cyberwarfare activities are these?', ['propaganda only', 'espionage and sabotage', 'phishing and propaganda', 'hacktivism'], 1, 'Collecting secrets is espionage; disrupting the supply is sabotage.'),
      mcq('Which Computer Misuse Act section covers access intended to commit a further offence?', ['Section 1', 'Section 2', 'Section 3', 'None'], 1, 'Section 2: unauthorised access with ulterior intent.'),
      mcq('Authentication answers which question?', ['What may you access?', 'Who are you?', 'Is the message unchanged?', 'Is the service up?'], 1, 'Authorisation decides what an authenticated principal may do.'),
      card('Black-, white- and grey-hat hackers?', 'Black: break in for malicious reasons. White: ethical, find flaws to strengthen security. Grey: in between, but not for personal gain.'),
      card('Why was the ILOVEYOU author never prosecuted?', 'The Philippines had no law covering it at the time. Laws must exist before misuse can be punished, as the Schifreen case showed in the UK.'),
      card('What does RIPA 2000 Part III allow?', 'The police can require someone to hand over cryptographic keys or passwords; refusing can mean up to two years in prison.'),
      card('Ransomware in one sentence?', 'Malware that encrypts the files on a computer and demands payment for the decryption key.'),
    ),
  ],
  summary='Hackers, malware, the Computer Misuse Act 1990, RIPA, and authentication, with a password key-space calculator.',
  decks=['spi-week-04'])

# ---------------------------------------------------------------- 5
lesson('spi-contracts', 'spi', 'Software contracts and liability', 40,
  'ECM1407 Week 5 lecture (Software Contract)',
  ['contract', 'contracts', 'scope of work', 'scope creep', 'indemnity', 'warranty', 'maintenance', 'arbitration', 'termination',
   'liability', 'negligence', 'strict liability', 'confidentiality', 'copyright ownership', 'Horizon', 'Boeing', 'service-oriented'],
  ['Define a contract and list the parts of a software development contract',
   'Explain scope of work, scope change and scope creep',
   'Explain indemnity, warranty, arbitration, termination and copyright ownership',
   'Explain the bases of software liability using Horizon and the 737 MAX'],
  [
    text('''<p>A <b>contract</b> is an agreement between parties that can be enforced by law. It defines their aims, obligations and responsibilities, the criteria for fulfilment, and how disputes are resolved. It needs a <b>valuable consideration</b> (some benefit, right or profit for one party, or some action or loss for the other) and an <b>intention to create legal relations</b>.</p>
    <p>A software development contract covers: confidentiality, scope of work, indemnity, the client’s responsibilities, warranty and maintenance, project control, arbitration procedures, copyright ownership, termination criteria, and liability.</p>'''),
    prime('Over the summer you freelance for a tech company without a written contract. Who owns the copyright in the code you write?', ['The company, because it paid you', 'You, the author, unless you assign it to them', 'You and the company equally', 'Nobody'], 1,
          'Employers own work their employees create in the course of employment. A freelancer is not an employee, so copyright stays with the author unless a contract assigns it.'),
    key('''<p><b>Scope of work</b>: the description of the work in the project, made of <b>product scope</b> (the features and functions of what will be produced) and <b>project scope</b> (the work needed to deliver it). It is hard to define, because clients often know what they want only at a high level. <b>Scope change</b> (the client changes or removes a feature, or the first definition had errors) is expected and may adjust budget and timeline. <b>Scope creep</b> is uncontrolled growth during development, such as one game feature demanding another.</p>
    <p><b>Denver International Airport</b>: the plan changed from each airline having its own baggage system to one integrated system for all airlines, but the timeline did not change. Decision makers underestimated the complexity and failed to recognise the risks. After ten years, United Airlines abandoned the system. Tesla’s production delays came from a similar assumption that more robots meant faster production.</p>
    <p>Software is not like building a bridge: in civil engineering, design is about 10% of the cost and construction 90%; in software, coding and unit testing are only about 15%, with the other 85% in architecture, detailed design, integration and system testing.</p>'''),
    key('''<table class="tbl"><tr><th>Clause</th><th>What it settles</th></tr>
    <tr><td>Client’s responsibilities</td><td>what the client must do or provide: essential data, cooperation (approving or rejecting prototypes), declaring final acceptance. Agile methods such as Extreme Programming depend on this involvement.</td></tr>
    <tr><td>Project control</td><td>how the work is managed: project managers on both sides, regular progress meetings</td></tr>
    <tr><td>Copyright ownership</td><td>either the copyright is assigned to the client on completion, or the software house licenses the software and keeps the copyright</td></tr>
    <tr><td>Confidentiality</td><td>neither side discloses the other’s confidential information; NDAs can be unilateral, bilateral or multilateral</td></tr>
    <tr><td>Indemnity</td><td>one party protects the other from legal consequences, e.g. the supplier covers the client against claims that the software infringes someone’s IP</td></tr>
    <tr><td>Warranty and maintenance</td><td>service after delivery, e.g. the software “will operate substantially in accordance with the specifications” for a set period; how long support lasts, and its budget. Open-source licences such as Python’s offer the software “AS IS”, with no warranty.</td></tr>
    <tr><td>Arbitration procedures</td><td>how disputes are resolved, e.g. scope creep where both sides believe they are right. Without them, a court looks at the contract itself, then inducements (statements made in negotiation), then implied terms (what the contract should have said, from normal practice or contract law).</td></tr>
    <tr><td>Termination criteria</td><td>when either party may end the contract: performance criteria, breach of contract, mutual agreement</td></tr></table>'''),
    key('''<p><b>Liability.</b> Product liability makes manufacturers liable for injuries caused by defective products; if a software defect injures users or causes them loss, they may sue. Claims are based on:</p>
    <ol><li><b>Strict liability</b>: responsible for the injury regardless of negligence or intent.</li>
    <li><b>Negligence</b>: failing to do what a reasonable person would do, e.g. reasonable development practices.</li>
    <li><b>Breach of warranty</b>: failing to meet a quality standard, e.g. fitness for purpose.</li></ol>
    <p>UK law: the Sale and Supply of Goods Act 1994 (goods must be fit for purpose), the Supply of Goods and Services Act 1982 (reasonable skill and care), and the law of negligence (a duty of care must exist). Licences often exclude liability for damages; Python’s licence is an example.</p>
    <p><b>Boeing 737 MAX</b>: software (MCAS) pushed the nose down based on sensor data. Risks were underestimated, the plane was sold as needing no new pilot training, and pilots did not know about the system. <b>Horizon</b>: Fujitsu won a £1bn contract to replace the Post Office’s accounting system, and rolled it out to 18,000 branches from October 1999. Staff reported accounting bugs almost immediately. Technical causes included transactions losing synchronisation in a distributed system, many users with powerful access rights, and unreliable logs. Between 2000 and 2014, 734 sub-postmasters were prosecuted on Horizon evidence, about one a week; the longest sentence was 3 years 4 months for £208,000 that was never stolen. A legal team formed in 2017, a trial began in 2018, and the first convictions were quashed in 2021.</p>
    <p>The lecture also covered <b>service-oriented architecture</b> (SOA): business functions offered as loosely coupled, message-based, reusable services that can evolve independently. Amazon moved from one big database application to around 150 services.</p>'''),
    explain('Essay practice. Should software companies be held strictly liable for software defects?',
            'For strict liability: users cannot inspect code, so the burden should sit with those who can (Horizon victims could not challenge the system); it pushes firms to test properly and gives victims compensation without proving negligence, as with other dangerous products (737 MAX). Against: bug-free software is impossible, so strict liability could make some software uninsurable, slow innovation and push out small firms and open-source projects, which offer code “AS IS” for free; negligence already punishes failing to follow reasonable practice. A middle path: strict liability for safety-critical systems, negligence and warranty for the rest.'),
    quiz(
      mcq('The scope of work grows without control during a project. This is…', ['scope change', 'scope creep', 'indemnity', 'termination'], 1, 'Scope change is managed and expected; creep is uncontrolled.'),
      mcq('Which clause makes the supplier protect the client against third-party IP claims?', ['warranty', 'indemnity', 'arbitration', 'confidentiality'], 1, 'Indemnity: saving the other party from a legal consequence.'),
      mcq('Failing to follow reasonable development practices is the basis of a claim in…', ['strict liability', 'negligence', 'breach of confidentiality', 'copyright'], 1, 'Negligence: not doing what a reasonable person would do.'),
      mcq('Without arbitration procedures, which source does a court look at first?', ['implied terms', 'inducements', 'the contract itself', 'the Horizon case'], 2, 'Then the statements made in negotiation, then implied terms.'),
      card('Product scope vs project scope?', 'Product scope: the features and functions of what will be produced. Project scope: the work needed to deliver it.'),
      card('Name the three bases of software liability claims.', 'Strict liability, negligence, and breach of warranty.'),
      card('Two options for copyright ownership in a software contract?', 'Assign the copyright to the client on completion, or the software house licenses the software and keeps the copyright.'),
      card('What went wrong technically in Horizon?', 'Transactions lost synchronisation in a distributed system, many users had powerful access rights, and logs were not reliably kept. The output was then treated as reliable evidence.'),
    ),
  ],
  summary='The clauses of a software contract, scope creep, and liability through Horizon and the 737 MAX.',
  decks=['spi-week-5-software-contract'])

# ---------------------------------------------------------------- 6
lesson('spi-professional', 'spi', 'Professional issues and ethics', 40,
  'ECM1407 Week 7 lecture (Professional Issues)',
  ['ethics', 'ethical', 'moral', 'morality', 'professional', 'dilemma', 'code of conduct', 'BCS', 'consequentialist', 'deontological',
   'universalizability', 'impartiality', 'conflict of interest', 'whistleblower', 'trolley'],
  ['Explain why users implicitly trust software, and where ethics enters the development lifecycle',
   'Distinguish ethics from morality, and consequentialist from nonconsequentialist theories',
   'Apply the universalizability and impartiality principles',
   'Use the BCS Code of Conduct on a professional dilemma'],
  [
    text('''<p>When you cross a bridge you rarely ask whether it is safe: you trust the engineers. People trust software the same way when they book a flight or pay a friend through a banking app, without seeing the code. Software is more powerful than a bridge (truly global and instant), so users will assume you have considered safety, ethics, impact and the environment, and they will be angry with the developers if something goes wrong.</p>
    <p><b>Ethics across the lifecycle.</b> Requirements: a client wants a feature that breaks data-protection rules, or charges .com visitors 30% more than .co.uk visitors. Design: a client asks you to make the site addictive. Development and testing: time is short; is it ethical to cut testing to finish features? Maintenance: someone misuses your software; is that your responsibility?</p>'''),
    prime('According to consequentialist theories, what makes an action right?', ['Its consequences', 'The nature of the act itself', 'Whether it is legal', 'Who performs it'], 0,
          'Consequentialist (teleological) theories judge an action by the good it produces. Nonconsequentialist (deontological) theories judge the act itself.'),
    key('''<p><b>Ethics</b> (moral philosophy) is the philosophical study of morality. <b>Morality</b> concerns beliefs about right and wrong, good and bad: <b>descriptive</b> morality is a code of conduct put forward by a society or group; <b>normative</b> morality is a code that all rational people would put forward. The trolley dilemma tests these intuitions.</p>
    <p><b>Universalizability principle</b>: a moral statement that applies in one situation must apply in all relevantly similar situations. An action cannot be wrong when A does it and right when B does it in similar circumstances. <b>Impartiality principle</b>: all persons are equal and should be treated accordingly. Obermeyer et al. (2019) found a widely used health algorithm that broke this: at the same risk score, Black patients were considerably sicker than White patients, because the algorithm predicted health-care <i>costs</i>, and less had historically been spent on Black patients with the same needs.</p>
    <p>A <b>moral theory</b> explains what makes an action right or a person good. <b>Consequentialist</b> (teleological) theories, such as utilitarianism: rightness depends on the consequences, the amount of good produced. <b>Nonconsequentialist</b> (deontological) theories, such as Kant’s: rightness depends on the nature of the action itself.</p>'''),
    code('A toy version of the cost-proxy bias', '''
        import numpy as np
        rng = np.random.default_rng(1)
        n = 10000
        group = rng.choice(["A", "B"], size=n)                       #: Two groups of patients, about half each.
        need = rng.gamma(2.0, 1.0, size=n)                           #: True health need: same distribution in both groups.
        cost = need * np.where(group == "A", 1.0, 0.7) + rng.normal(0, 0.2, n)   #: Historically, less is spent on group B for the same need.
        chosen = cost >= np.quantile(cost, 0.9)                      #: The "algorithm" offers extra care to the top 10% by cost.
        for g in ["A", "B"]:
            m = group == g
            print(f"group {g}: {m.mean():.0%} of patients, {chosen[m].sum() / chosen.sum():.0%} of places, "
                  f"average need of those chosen {need[m & chosen].mean():.2f}")
        ''',
        intro='A made-up simulation of the mechanism Obermeyer et al. found, not their data.',
        predict=('Both groups are equally ill on average. What share of the extra-care places will group B get?', ['About 50%', 'Clearly less than 50%', 'Clearly more than 50%'], 1,
                 'Ranking by cost instead of need under-counts group B, so fewer of them are chosen, and those who are chosen must be sicker to qualify.'),
        investigate=[('Which principle does this break, and where did the bias come from?', 'Impartiality: equally ill people are not treated equally. Nobody wrote a rule about groups; the bias came from choosing cost as a proxy for need.')]),
    key('''<p><b>Professional dilemmas from the lecture</b></p>
    <table class="tbl"><tr><th>Dilemma</th><th>Case</th></tr>
    <tr><td>Claim experience you do not have?</td><td>In 1998, “MOVA” (Multiple Object Versionless Architecture) was invented to catch job candidates claiming skills they lacked: it does not exist.</td></tr>
    <tr><td>Delay the launch of an unsafe product?</td><td>Three BART engineers in California raised safety problems; management dismissed them and the board rejected their concerns, and the engineers were dismissed.</td></tr>
    <tr><td>Disclose a conflict of interest?</td><td>Frances Haugen revealed conflicts between what was good for the public and what was good for Facebook; US senators invest in firms they regulate.</td></tr>
    <tr><td>Share copyrighted material with a colleague?</td><td>Surveys show many people get software through a mix of legal and illegal means.</td></tr>
    <tr><td>Report a colleague or company acting illegally?</td><td>Whistleblowing.</td></tr></table>
    <p><b>Why ethics matters especially in computing</b>: IT professionals have great <b>knowledge</b>, but others cannot easily check their work; and great <b>reach</b>, but others cannot easily avoid their work.</p>
    <p><b>Codes of conduct</b> enforce standards: BCS (The Chartered Institute for IT), ACM and IEEE. The <b>BCS Code of Conduct</b> has four principles: <b>public interest</b> (regard for public health, privacy, security and wellbeing, the environment, and the rights of third parties, without discrimination); <b>professional competence and integrity</b> (only take on work you are competent to do, and never claim competence you lack); <b>duty to relevant authority</b> (act for employers and clients with due care, avoid conflicts of interest, respect confidentiality); and <b>duty to the profession</b> (uphold the reputation of the profession and support fellow members).</p>'''),
    explain('Essay practice. Your manager tells you to cut the testing phase so a health app can launch on time, although you know of unresolved defects. What should you do? Use the BCS principles.',
            'Public interest comes first: shipping a health app with known defects risks users’ health, so you should not simply comply. Professional integrity means stating the risk honestly rather than signing off work you believe is unsafe. Duty to the relevant authority means raising it properly with your employer: document the defects and their likely impact, and propose options such as a smaller launch or a short delay. If the risk is serious and ignored, escalate, as the BART engineers did; consequentialist reasoning (the harm to users) and deontological reasoning (the duty not to deceive users) point the same way.'),
    quiz(
      mcq('“If it is wrong for A to do this, it is wrong for B to do it in similar circumstances.” Which principle?', ['impartiality', 'universalizability', 'consequentialism', 'confidentiality'], 1, 'Universalizability: moral statements must apply to all relevantly similar cases.'),
      mcq('Which BCS principle is broken by claiming competence you do not have?', ['public interest', 'professional competence and integrity', 'duty to relevant authority', 'duty to the profession'], 1, 'Only undertake work within your competence, and do not misrepresent it.'),
      mcq('A nonconsequentialist judges an action by…', ['its outcomes', 'the nature of the act itself', 'public opinion', 'its legality'], 1, 'Deontological theories focus on duties and the act.'),
      mcq('Why did the health algorithm studied by Obermeyer et al. disadvantage Black patients?', ['It used race as an input', 'It predicted cost as a proxy for need', 'Its developers intended it', 'It had too little data'], 1, 'Less had been spent on equally sick Black patients, so cost under-stated their need.'),
      card('Name the four principles of the BCS Code of Conduct.', 'Public interest; professional competence and integrity; duty to relevant authority; duty to the profession.'),
      card('Descriptive vs normative morality?', 'Descriptive: the code of conduct a society or group actually puts forward. Normative: the code that all rational people would put forward.'),
      card('Why do IT professionals carry special ethical responsibility?', 'Great knowledge that others cannot easily check, and great reach that others cannot easily avoid.'),
      card('Give an ethical issue at each lifecycle stage.', 'Requirements: features that break data protection or price unfairly. Design: deliberately addictive design. Testing: cutting tests to hit a deadline. Maintenance: misuse of your software.'),
    ),
  ],
  summary='Trust in software, moral theories and principles, professional dilemmas and the BCS Code of Conduct.',
  decks=['spi-week-7-professional-issues'])

# ---------------------------------------------------------------- 7
lesson('spi-social-1', 'spi', 'Technology, its critics and its environmental cost', 40,
  'ECM1407 Week 8 lecture (Social Issues I; Computers, Climate Change and Sustainability)',
  ['AI', 'artificial intelligence', 'machine learning', 'robotics', 'Turing test', 'CAPTCHA', 'assisted intelligence', 'autonomous AI', 'augmented intelligence',
   'Luddites', 'Neo-Luddites', 'Ned Ludd', 'unemployment', 'manufactured needs', 'planned obsolescence', 'e-waste', 'social inequity', 'social disintegration',
   'singularity', 'climate change', 'sustainability', 'greenhouse', 'net zero', 'Paris Agreement', 'data centre', 'PUE', 'energy', 'service level agreement', 'SLA'],
  ['Define AI, machine learning and robotics, and the three flavours of AI decisions',
   'Explain who the Luddites were and the six fears of the Neo-Luddites, with evidence on both sides',
   'Check the lecture’s figures on the energy cost of searching',
   'Explain PUE and the trade-off between energy efficiency and quality of service'],
  [
    text('''<p>Social Issues I asks two questions: how does technology help us now, and should we fear it, or even limit how far it advances? The second half turns to computers, climate change and sustainability. (The title slide says Week 9, but the agenda places Social Issues I in Week 8 and Social Issues II in Week 9.)</p>'''),
    prime('Who were the original Luddites?', ['opponents of all technology', 'skilled textile workers who smashed machines they feared would take their livelihood', 'followers of a real leader called Ned Ludd', 'early critics of computers'], 1,
          'They were artisans who had spent years learning their craft. Ned Ludd, who supposedly smashed two stocking frames in 1779, probably never existed.'),
    key('''<p><b>Artificial intelligence</b> is a branch of computer science that makes computers perform tasks we (used to) think of as requiring human intelligence (Norvig and Russell). <b>Machine learning</b> is a subset of AI: systems that learn and improve from experience without being explicitly coded. In <b>supervised</b> learning the task is to learn a mapping from inputs (features, covariates or predictors) to an output (label, target or response); in <b>unsupervised</b> learning there are inputs but no outputs, and the task is to make sense of the data. <b>Robotics</b> is a branch of engineering that makes mechanical devices perform physical tasks we (used to) think of as human-like.</p>
    <p>The lecture names three flavours of AI decisions: <b>assisted intelligence</b> (AI helps people with a task while people decide), <b>augmented intelligence</b> (people and AI decide together, with AI extending what people can do) and <b>autonomous AI</b> (the system decides and acts by itself). An <b>artificial brain</b>, a machine “as intelligent, creative, and self-aware as humans”, has never been built. The <b>Turing test</b> asks whether a machine’s conversation can pass for a human’s; a <b>CAPTCHA</b> (Completely Automated Public Turing test to tell Computers and Humans Apart) turns the test round, so that a computer checks whether you are human.</p>'''),
    key('''<p><b>Neo-Luddites</b> are anti-technology: they see computers as enabling big corporations to pursue profit more efficiently while destroying nature. Their six fears, with the lecture’s evidence and a counterpoint for essays:</p>
    <table class="tbl"><tr><th>Fear</th><th>Evidence in the lecture</th><th>Counterpoint</th></tr>
    <tr><td>Unemployment</td><td>automation risk is highest in low-paid, less-educated jobs (Bloomberg’s 2017 job-risk chart), widening the gap; without the “dignity” of work, people ask why they are here and how to behave</td><td>new technology has also created new kinds of work since the original Luddites</td></tr>
    <tr><td>Manufactured needs</td><td>we mistake wants for needs; planned obsolescence (products designed to have a limited useful life) piles up e-waste; influencers create demand; paid social media models (CPC, CPM, CPV, CPA)</td><td>some upgrades bring real benefits, such as security and accessibility</td></tr>
    <tr><td>Social inequity</td><td>students in low-income US households are far more likely to have no internet or computer at home</td><td>cheaper devices and public access can narrow the gap</td></tr>
    <tr><td>Social disintegration</td><td>the mere presence of a phone can lower the quality of a conversation (Misra et al., 2016); heavier social media use is linked to depression in teenage girls (Kelly et al., 2018)</td><td>these are associations, not proof of cause, and technology also keeps people in touch</td></tr>
    <tr><td>Benefits to big business and government</td><td>huge amounts of data about us; an “always on” culture</td><td>regulation such as data-protection law can rebalance power</td></tr>
    <tr><td>An ominous uniformity of knowledge</td><td>computers in school may thwart social and intellectual skills and human values; echo chambers</td><td>the web also gives access to more points of view than ever before</td></tr></table>
    <p>The <b>technological singularity</b> is a point at which AI, or technology in general, advances so far that we can no longer comprehend it; it would become uncontrollable and irreversible. Elon Musk, Stephen Hawking and others signed an open letter on AI and its impact on society.</p>'''),
    code('Paying for attention: what does an advert campaign cost?', '''
        impressions = 200_000            #: How many times the advert is shown.
        click_rate = 0.012               #: 1.2% of views lead to a click…
        conversion_rate = 0.03           #: …and 3% of clicks lead to a purchase (a "conversion").
        clicks = impressions * click_rate
        conversions = clicks * conversion_rate
        costs = {"CPM (per 1,000 impressions)": 5.00 * impressions / 1000,
                 "CPC (per click)": 0.40 * clicks,
                 "CPA (per conversion)": 12.00 * conversions}
        print(f"{clicks:.0f} clicks, {conversions:.0f} conversions")
        for model, cost in costs.items():
            print(f"{model:<28} £{cost:,.2f}")
        ''',
        intro='Made-up prices, to compare the paid models listed on the slides.',
        predict=('Under CPA, who carries the risk that nobody buys?', ['the advertiser', 'the platform', 'the customer'], 1,
                 'The advertiser pays only when someone converts, so views that do not sell earn the platform nothing. That gives platforms every reason to make adverts persuasive and keep people scrolling: the Neo-Luddite worry about manufactured needs.'),
        investigate=[('What does CPV stand for?', 'Cost per video view: the advertiser pays each time a video advert is watched.')]),
    key('''<p><b>Computers, climate change and sustainability.</b> Intelligence comes from information, but at what cost to privacy, and to energy? The UN’s 17 Sustainable Development Goals call for action by all countries, poor, rich and middle-income, to promote prosperity while protecting the planet. The Paris Agreement aims to keep warming well below 2 °C above pre-industrial levels and to pursue 1.5 °C; the Earth is already about 1.1 °C warmer than in the late 1800s, projections run well above 3 °C by 2100, and the COP conferences aim for net zero by 2050. Most emissions come from a few countries: seven top emitters (China, the USA, India, the EU, Indonesia, Russia and Brazil) produced half of all greenhouse emissions in 2020.</p>
    <p>Greenhouse gases (CO₂, methane, nitrous oxide and fluorinated gases) can stay in the atmosphere for thousands of years. ICT contributes around 3–4% of greenhouse emissions (Freitag et al., 2021), and IoT, AI, big data, blockchain and cryptocurrencies are known to increase them. ICT (data centres, user devices and communication networks) uses energy in production, in powering devices and in accessing digital services: 4–6% of all the electricity used globally in 2020. Energy-efficient ICT could cut that consumption by 50% by 2030. Making a new phone emits about 40–80 kg of CO₂, and behind every video, message, photo and email a server is working.</p>'''),
    code('Checking the lecture’s numbers on searching', '''
        per_second = 40_000                   #: Searches per second (slide).
        kwh_per_search = 0.0003               #: Energy per search (slide): 0.0003 kWh, about 1 kJ.
        per_day = per_second * 60 * 60 * 24
        per_year = per_day * 365
        print(f"searches per day:  {per_day:,}")       #: The slide says 1.2 billion.
        print(f"searches per year: {per_year:,}")      #: The slide says 1.2 trillion.
        print(f"energy for one second of searching: {per_second * kwh_per_search:.0f} kWh")
        print(f"energy for a year of searching: {per_year * kwh_per_search / 1e6:,.0f} GWh")
        bulb_seconds = kwh_per_search * 3_600_000 / 60       #: kWh to joules (× 3.6 million), then ÷ 60 W.
        print(f"one search ≈ a 60 W bulb for {bulb_seconds:.0f} seconds")
        ''',
        predict=('At 40,000 searches a second, is the slide’s “1.2 billion searches per day” right?', ['yes', 'no: it is about 3.5 billion', 'no: it is about 12 million'], 1,
                 '40,000 × 86,400 seconds = 3.456 billion a day. The yearly figure, 1.2 trillion, does match 40,000 a second, so the daily figure on the slide is the odd one out: always check that numbers agree with each other.'),
        investigate=[('Is 0.0003 kWh per search still a fair figure?', 'It is an old estimate, published by Google in 2009. Hardware has become more efficient since, while AI-generated answers are estimated to use several times more energy per query. Always look for the date and source of an energy figure.'),
                     ('The slide says one search is like a 60 W bulb for 17 seconds; the code says 18. Who is right?', 'Both, roughly: 0.0003 kWh is 1,080 J, which runs 60 W for 18 seconds, while 1 kJ gives the slide’s 17.')]),
    key('''<p><b>Data centres</b> hold servers, lighting, air conditioning and network equipment. Their number is growing fast, and <b>resource idleness</b> (servers switched on but doing little) is a major issue. Mitigations include renewable sources, cooling management and natural cooling. <b>PUE</b> (Power Usage Effectiveness) = total facility energy ÷ energy used by the IT equipment; a perfectly efficient centre scores 1.0.</p>
    <p><b>Barriers.</b> A common belief is that good service quality and high utilisation of resources cannot coexist. Cloud providers promise performance in <b>service level agreements</b> (SLAs), so sacrificing quality to save energy is a big ask. Would you wait longer for the sake of energy conservation? Should a provider risk its reputation to save energy? Who should take responsibility?</p>'''),
    code('PUE and idle servers', '''
        it_kwh = 1_000_000            #: Yearly energy used by the servers themselves.
        cooling_kwh = 450_000          #: Air conditioning…
        other_kwh = 50_000             #: …lighting and power losses.
        pue = (it_kwh + cooling_kwh + other_kwh) / it_kwh
        print(f"PUE = {pue:.2f}: {1 - 1 / pue:.0%} of the energy never reaches a server")
        ## Provisioned versus actual use
        provisioned = 100              #: Servers kept switched on, ready for the peak.
        needed = [22, 18, 15, 14, 16, 25, 40, 62, 75, 80, 83, 85, 86, 84, 82, 80, 78, 74, 65, 55, 45, 38, 30, 25]   #: Servers actually needed in each hour of one day.
        utilisation = sum(needed) / (provisioned * len(needed))
        print(f"average utilisation {utilisation:.0%}; idle server-hours in the day: {provisioned * 24 - sum(needed)}")
        ''',
        intro='A made-up data centre, to make the slides’ PUE and provisioning charts concrete.',
        predict=('A data centre has a PUE of 1.5. What share of its energy goes on things other than computing?', ['0.5%', 'a third', 'a half', '1.5%'], 1,
                 'PUE 1.5 means 1.5 kWh in total for every 1 kWh of computing: 0.5 out of 1.5 is a third.'),
        investigate=[('Why do providers keep servers idle at night?', 'To honour their SLAs at peak demand: a slow or failed service costs reputation and money, so they provision for the peak. Saving energy means accepting some risk to quality of service, which is the trade-off on the slides.')],
        modify=[('Natural cooling cuts cooling to 150,000 kWh. What is the new PUE?', 'Change `cooling_kwh` and recompute.', '''
                cooling_kwh = 150_000
                pue = (it_kwh + cooling_kwh + other_kwh) / it_kwh
                print(f"PUE = {pue:.2f}")''')]),
    explain('Essay practice. “Computers do society more harm than good.” Argue both sides, using the Neo-Luddite fears and the lecture’s environmental evidence.',
            'For: automation threatens jobs, with the highest risk in low-paid, less-educated work; planned obsolescence and influencer-driven demand turn wants into needs and pile up e-waste; unequal access to computers and the internet deepens inequity; phones can lower the quality of conversation, and heavy social media use is linked to depression in teenage girls; big firms and governments gain data and power; echo chambers narrow what people know; and ICT already causes around 3–4% of greenhouse emissions and uses 4–6% of the world’s electricity. Against: computers help in search, navigation, medicine and support for disabled people; fears for jobs have recurred since the Luddites while new work appeared; links between phones and depression are associations, not proof of cause; access gaps can narrow as prices fall; and efficiency (PUE near 1, renewables, natural cooling) can cut ICT’s footprint while ICT reduces emissions elsewhere. A balanced conclusion: the harm depends on choices about regulation, design and energy, more than on computers themselves.'),
    quiz(
      mcq('Machine learning is…', ['the same thing as AI', 'a subset of AI in which systems learn from data without being explicitly coded', 'a branch of robotics', 'a kind of Turing test'], 1, 'AI is the wider field; ML is one approach within it.'),
      mcq('CAPTCHA stands for…', ['Computer Assisted Program To Check Human Access', 'Completely Automated Public Turing test to tell Computers and Humans Apart', 'Central Authority for Privacy and Tracking of Computer Hardware Access', 'nothing: it is not an acronym'], 1, 'A reverse Turing test: the computer checks whether you are human.'),
      card('The six Neo-Luddite fears?', 'Unemployment; manufactured needs; social inequity; social disintegration; benefits to big business and government; an ominous uniformity of knowledge.'),
      mcq('Planned obsolescence means…', ['products designed to have a limited useful life', 'products banned by regulation', 'recycling old devices', 'software updates that add features'], 0, 'It drives faster replacement and more e-waste.'),
      card('What is the technological singularity?', 'A point at which AI, or technology in general, advances so far that we can no longer comprehend it: uncontrollable and irreversible.'),
      mcq('A PUE of 1.0 means…', ['the data centre uses no energy', 'every kWh goes to the IT equipment', 'half the energy is used for cooling', 'the centre runs on renewables'], 1, 'PUE = total facility energy ÷ IT equipment energy.'),
      card('Roughly what share of greenhouse emissions comes from ICT, according to the lecture?', 'Around 3–4% (Freitag et al., 2021), and growing with IoT, AI, big data, blockchain and cryptocurrencies.'),
      mcq('Why is energy efficiency hard for cloud providers?', ['renewables are not allowed', 'saving energy can reduce the quality of service that SLAs promise', 'servers cannot be switched off', 'PUE cannot go below 2'], 1, 'The trade-off between energy efficiency and quality of service.'),
    ),
  ],
  summary='AI, ML and robotics; the Luddites and the Neo-Luddite fears; ICT’s energy use, PUE and the trade-off with quality of service.',
  decks=['spi-week-08-social-issues-1'])

# ---------------------------------------------------------------- 8
lesson('spi-social-2', 'spi', 'Social issues online and offline: data, misinformation and algorithms', 45,
  'ECM1407 Week 9 lecture (Social Issues II)',
  ['technological diffusion', 'normalization', 'normalisation', 'stratification', 'winner-take-all', 'oligopoly', 'digital divide', '5G',
   'wisdom of the crowd', 'Wikipedia', 'Cambridge Analytica', 'microtargeting', 'psychographics', 'OCEAN', 'Big Five', 'misinformation',
   'disinformation', 'fake news', 'deepfake', 'fact-checking', 'content moderation', 'filter bubble', 'echo chamber', 'computer model',
   'all models are wrong', 'COMPAS', 'recidivism', 'husky', 'wolf', 'alignment', 'explainable AI', 'interpretable', 'Rudin'],
  ['Compare the normalisation and stratification models of technological diffusion, and explain the digital divide',
   'Explain how Cambridge Analytica obtained data, and what psychographic targeting can and cannot do',
   'Tell misinformation from disinformation, and filter bubbles from echo chambers',
   'Question a computer model with three questions, using healthcare, COMPAS and husky-or-wolf'],
  [
    text('''<p>People invent and adopt technology, and technology changes society and people: experience physically changes brains (London taxi drivers), and technology can have psychological effects, such as dependency on phones. Technologies solve problems but may create new ones: cars, refrigerators, cheap international communication. This lecture looks at how technology spreads, then at online case studies (Cambridge Analytica, misinformation, filter bubbles and echo chambers) and offline ones (computer models, and algorithms in healthcare and the justice system). The slides head the offline part “Week 8”, but it belongs to this Week 9 lecture.</p>'''),
    prime('A filter bubble and an echo chamber are…', ['the same thing', 'different: a bubble limits what you are shown; a chamber actively distrusts and excludes outsiders', 'both illegal', 'both caused only by search engines'], 1,
          'A filter bubble comes from platforms personalising what you see. In an echo chamber, the people inside distrust everyone outside and actively exclude and discredit them.'),
    key('''<p><b>Technological diffusion</b> is the rate at which a new technology is assimilated. Group A has the highest socioeconomic status, B the middle and C the lowest. In the <b>normalisation model</b>, A adopts first, then B, then C, and eventually all three use it equally. In the <b>stratification model</b> the order is the same, but A’s use stays above B’s, and B’s above C’s, forever.</p>
    <p><b>Winner-take-all</b>: a few top performers take a disproportionate share of the wealth, as in the mobile phone market, an oligopoly. The <b>digital divide</b>: some people have access to modern information technology while others do not. The internet is assumed to be everywhere, new technologies are often available only to the wealthy, and cost is not the only factor: ease of use matters too. Entrepreneurs provide low-cost options for people who could not otherwise afford them. Globally, access is higher in wealthy countries, where IT infrastructure is good and where it is culturally valued; socially, it is higher for young, well-educated and literate people. 5G shows the geography of the divide: low-frequency bands travel far and pass through obstacles, while high-frequency bands give much higher data rates over shorter distances, and coverage varies widely between UK local authorities.</p>
    <p><b>Responsible judgement</b>: there is a daunting amount of information on the web, and much of it is not correct. Search engines are replacing librarians, but they rank websites by popularity, not by expert evaluation. Wikipedia is written by volunteers: some posts are biased or inaccurate, although its writers are typically educated and expert.</p>'''),
    code('Two models of technological diffusion', '''
        import numpy as np
        import matplotlib.pyplot as plt
        years = np.arange(0, 31)
        def adoption(start, ceiling):
            return ceiling / (1 + np.exp(-(years - start) / 2.5))     #: An S-shaped curve: slow start, rapid spread, levelling off.

        models = {"Normalisation": {"A": (5, 0.95), "B": (10, 0.95), "C": (15, 0.95)},
                  "Stratification": {"A": (5, 0.95), "B": (10, 0.75), "C": (15, 0.5)}}
        fig, axes = plt.subplots(1, 2, figsize=(9, 3.4), sharey=True)
        for ax, (name, groups) in zip(axes, models.items()):
            for g, (start, ceiling) in groups.items():
                ax.plot(years, adoption(start, ceiling), label=f"group {g}")
            ax.set_title(name); ax.set_xlabel("years after launch")
        axes[0].set_ylabel("share of the group using it"); axes[0].legend()
        plt.show()
        for name, groups in models.items():
            print(f"{name:>14} after 30 years:", {g: round(float(adoption(s, c)[-1]), 2) for g, (s, c) in groups.items()})
        ''',
        intro='Made-up curves that show the shapes of the two models, not real data.',
        predict=('In the stratification model, what happens to the gap between groups A and C after 30 years?', ['it closes', 'it stays', 'it reverses'], 1,
                 'C catches up only to its own lower ceiling: A’s use stays above B’s, and B’s above C’s, forever.'),
        investigate=[('Which model might fit 5G, and why?', 'Possibly stratification: high-frequency 5G needs dense, costly infrastructure that pays off best in towns and wealthier areas, so without public investment some places could stay behind for good. Basic mobile phones, with cheap handsets, look closer to normalisation.')]),
    key('''<p><b>Cambridge Analytica</b> used data from Facebook to target people with political messages. It worked with the 2016 presidential campaigns of Ted Cruz and Donald Trump; it was also accused of interfering in the Brexit referendum, but an investigation found no evidence of that. <b>How did it get the data?</b> About 270,000 users completed a personality quiz; a loophole in Facebook’s API then exposed data about their friends too, without those users’ consent. (Facebook later estimated that up to 87 million people were affected: roughly 320 for every quiz-taker.)</p>
    <p><b>Psychographic microtargeting.</b> Microtargeting is a direct marketing technique that tracks and targets specific individuals (customers, supporters, voters). Psychographics describes individuals by psychological attributes, such as the Big Five personality traits (OCEAN: openness, conscientiousness, extraversion, agreeableness, neuroticism). You do not need to complete any quiz to have a psychological profile: digital records of behaviour expose personal traits (Kosinski et al., 2013). Does it work? Product adverts matched to personality types got 40% more clicks (Matz et al., 2017), but there is no evidence that it changes voting preferences or behaviour.</p>
    <p><b>Misinformation</b> is false information spread without the intention to deceive; <b>disinformation</b> is spread deliberately to deceive, as with much fake news (Lazer et al., 2018). Both can be subtle, which makes the truth hard to assess, and both spread fast and are dangerous. <b>Deepfakes</b> are synthetic media in which one person’s likeness is replaced with another’s, often very convincingly. Responses include <b>fact-checking</b> (verifying claims in media and public statements) and <b>content moderation</b> (monitoring platforms to stop false content spreading). Should social media platforms fact-check adverts?</p>
    <p>A <b>filter bubble</b> is the intellectual or ideological isolation that can result when platforms such as Google and Facebook limit what news and information we see, based on our past behaviour, search history or demographic profile. An <b>echo chamber</b> is a situation in which the people inside distrust everybody outside; outsiders are actively excluded and discredited.</p>'''),
    key('''<p><b>Computer models.</b> A computer model, or simulation, is a system designed to predict the behaviour or outcome of a real-world phenomenon, such as population growth, where researchers disagree about how far the global population will rise. “All models are wrong, but some are useful” (the statistician George Box). When you see a model, ask:</p>
    <ol><li>How well do the modellers understand the underlying science or theory of the system they are studying?</li>
    <li>What are the assumptions and simplifications in the model?</li>
    <li>How closely do the model’s predictions correspond with results from real experience?</li></ol>
    <p><b>Healthcare.</b> An algorithm to decide which patients need follow-up care used predicted cost as a stand-in for medical need, but cost ≠ need. Ranking by cost, 18% of the patients selected were Black; ranking by need, 46.5% would have been (Obermeyer et al., 2019; the Professional issues lesson simulates this mechanism). <b>Justice.</b> COMPAS (Correctional Offender Management Profiling for Alternative Sanctions) predicts recidivism, and such risk assessments can be used at every stage of the criminal justice system. ProPublica found that it wrongly labelled Black defendants as future criminals at almost twice the rate of white defendants, while white defendants were mislabelled as low risk more often. One example on the slides: a defendant with one attempted burglary, who went on to three drug possessions, was rated low risk (3); another with one count of resisting arrest without violence, and no later offences, was rated high risk (10).</p>'''),
    code('The husky-or-wolf trap: a model that learns the background', '''
        from sklearn.linear_model import LogisticRegression
        rng = np.random.default_rng(0)
        def photos(n, p_snow_wolf, p_snow_husky):
            wolf = rng.random(n) < 0.5
            snow = np.where(wolf, rng.random(n) < p_snow_wolf, rng.random(n) < p_snow_husky)   #: Is there snow in the background?
            ears = rng.normal(np.where(wolf, 0.6, 0.4), 0.25)                               #: A weak real clue about the animal itself.
            return np.c_[snow, ears], wolf

        X_train, y_train = photos(500, 0.9, 0.1)       #: Training photos: wolves nearly always in snow, huskies rarely.
        X_new, y_new = photos(500, 0.1, 0.9)           #: New photos with the backgrounds swapped.
        both = LogisticRegression().fit(X_train, y_train)
        animal = LogisticRegression().fit(X_train[:, 1:], y_train)   #: A model allowed to look only at the animal.
        print(f"snow + animal: training {both.score(X_train, y_train):.2f}, swapped backgrounds {both.score(X_new, y_new):.2f}")
        print(f"animal only:   training {animal.score(X_train[:, 1:], y_train):.2f}, swapped backgrounds {animal.score(X_new[:, 1:], y_new):.2f}")
        print("weights of the first model [snow, animal]:", both.coef_.round(2))
        ''',
        intro='Made-up data that mimics the story on the slides, not real photos.',
        predict=('On new photos with the backgrounds swapped, how will the snow + animal model do?', ['still about 90%', 'about 50%', 'far below 50%'], 2,
                 'It learned “snow means wolf”. With huskies in snow and wolves on grass, it is wrong most of the time: worse than guessing.'),
        investigate=[('The first model scores higher in training. Which would you deploy?', 'The animal-only model: its training score is lower, but it uses a real feature, so it keeps working when the backgrounds change. A high score can hide a shortcut, as with the slide’s “80% accuracy”.'),
                     ('How do the weights reveal the problem?', 'The snow weight (about 3.7) applies to a feature that is 0 or 1, while the animal weight (about 2.9) multiplies differences of about 0.2 between typical wolves and huskies. Snow moves the prediction roughly six times as much: inspecting an interpretable model shows what it really uses.')]),
    key('''<p><b>Is it a husky or a wolf?</b> An app’s classifier reached about 80% accuracy, but its predictions were based on whether there was snow in the background. This is a small case of the <b>alignment problem</b>: how to ensure that AI models capture our norms and values, understand what we mean or intend, and do what we want. <b>Explainable AI</b> is a set of tools and frameworks for understanding and interpreting the predictions a model makes, for example by showing the parts of an image (prototypical structures) it relied on. Cynthia Rudin (2019) argues that for high-stakes decisions we should stop explaining black-box models and use <b>interpretable</b> models instead. COMPAS is a closed box with more than 180 factors; the slide’s data-driven alternative is a scoring system anyone can check:</p>
    <table class="tbl"><tr><th>Rule</th><th>Points</th></tr>
    <tr><td>Prior arrests ≥ 2</td><td>1</td></tr><tr><td>Prior arrests ≥ 5</td><td>1</td></tr>
    <tr><td>Prior arrests for local ordinance</td><td>1</td></tr><tr><td>Age at release between 18 and 24</td><td>1</td></tr>
    <tr><td>Age at release ≥ 40</td><td>−1</td></tr></table>
    <p>Total scores of −1, 0, 1, 2, 3 and 4 correspond to risks of 11.9%, 26.9%, 50.0%, 73.1%, 88.1% and 95.3%.</p>'''),
    code('An interpretable risk score', '''
        import math
        def score(prior_arrests, local_ordinance_arrests, age_at_release):
            points = 0
            points += prior_arrests >= 2                  #: True counts as 1 point.
            points += prior_arrests >= 5
            points += local_ordinance_arrests > 0
            points += 18 <= age_at_release <= 24
            points -= age_at_release >= 40
            return int(points)

        def risk(points):
            return 100 / (1 + math.exp(-(points - 1)))    #: The slide's risk table fits a logistic curve that passes 50% at 1 point.

        print([round(risk(p), 1) for p in range(-1, 5)])
        for person in [(3, 0, 22), (6, 1, 30), (1, 0, 45)]:
            p = score(*person)
            print(f"{person} -> {p} points, {risk(p):.1f}% risk")
        ''',
        predict=('Someone with 6 prior arrests, 1 of them for a local ordinance, released at 30. How many points?', ['1', '2', '3', '4'], 2,
                 'Prior arrests ≥ 2 and ≥ 5 give 2 points, the local-ordinance arrest gives 1, and age 30 adds nothing: 3 points, about 88% risk.'),
        investigate=[('What does the logistic curve remind you of?', 'Logistic regression in COM1011: the risk is 1 ÷ (1 + e^−(points − 1)), so this scoring system is a logistic model whose weights are small whole numbers that a person can check by hand.'),
                     ('Could this model still be unfair?', 'Yes. Arrest records reflect how heavily different communities are policed, so even a transparent model can carry historical bias. Interpretability lets people see and challenge that; it does not remove it.')]),
    explain('Essay practice. Should algorithms help judges decide on bail and sentencing?',
            'For: algorithms apply the same rules to everyone, can weigh many factors consistently, may reduce the effect of an individual judge’s mood or prejudice, and could save money while protecting the public. Against: ProPublica found COMPAS wrongly labelled Black defendants as future criminals at almost twice the rate of white defendants; inputs such as arrest records can carry historical bias, just as cost did in the healthcare algorithm; a closed model with 180+ factors cannot be checked or challenged by the people it judges; accuracy is not the same as fairness; and models can learn shortcuts, like the husky-or-wolf classifier. Apply the three model questions: how well is reoffending understood, what does the model assume, and how do its predictions compare with real outcomes? A middle position: allow only interpretable, independently audited models (as Rudin argues), keep the decision with the judge, and give defendants the right to see and challenge their score.'),
    quiz(
      mcq('Group A adopts first, then B, then C, and eventually all three use it equally. Which model?', ['stratification', 'normalisation', 'winner-take-all', 'oligopoly'], 1, 'In the stratification model the gaps never close.'),
      mcq('How did Cambridge Analytica reach far beyond the 270,000 quiz-takers?', ['it hacked Facebook’s servers', 'a loophole in the API exposed the quiz-takers’ friends', 'it bought census data', 'the friends consented in the quiz'], 1, 'Their data was taken without their consent.'),
      card('Misinformation vs disinformation?', 'Both are false. Misinformation spreads without intent to deceive; disinformation is spread deliberately to deceive.'),
      card('The three questions to ask of any computer model?', 'How well do the modellers understand the underlying science? What are the assumptions and simplifications? How closely do the predictions match real experience?'),
      mcq('The husky-or-wolf classifier scored about 80%. What was it really detecting?', ['ear shape', 'fur colour', 'snow in the background', 'eye colour'], 2, 'A shortcut that fails as soon as the backgrounds change.'),
      mcq('Selecting patients by predicted cost picked 18% Black patients. Selecting by need would have picked…', ['10%', '18%', '46.5%', '80%'], 2, 'Cost ≠ need: less had been spent on equally sick Black patients.'),
      card('What is the alignment problem?', 'How to ensure AI models capture our norms and values, understand what we mean or intend, and do what we want.'),
      mcq('Psychographic targeting of product adverts…', ['has no effect', 'gave about 40% more clicks in one study, with no evidence that it changes votes', 'is proven to swing elections', 'needs everyone to take a quiz first'], 1, 'Matz et al. (2017) for the clicks; the lecture found no evidence for votes.'),
    ),
  ],
  summary='Technological diffusion and the digital divide, Cambridge Analytica, misinformation, filter bubbles and echo chambers, then models, COMPAS, husky-or-wolf and explainable AI.',
  decks=['spi-week-09'])
