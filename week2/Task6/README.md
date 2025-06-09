<img src="enigma.png" alt="Broken Enigma Machine" width="300"/>
Enigma Machine CLI
enigma.js contains a simplified command-line Enigma machine implementation. The Enigma was a rotor-based cipher device used for secure communication in the early 20th century.

Usage
You can use the CLI to encrypt or decrypt messages using a configurable Enigma setup (rotors, plugboard, reflector).

How to Run
Ensure you have Node.js installed.
Navigate to the directory with enigma.js in your terminal.
Run the program using: bash node enigma.js
Follow the prompts to enter your message and configuration.
Detailed Instructions
When you run the program, you will be prompted for several configuration options:

1. Enter message
Type the message you want to encrypt or decrypt. Only A-Z letters are processed; other characters are passed through unchanged.
2. Rotor positions (e.g. 0 0 0)
Enter three numbers (space-separated), each from 0 to 25, representing the initial position of each rotor (left to right). For example, 0 0 0 means all rotors start at 'A'.
3. Ring settings (e.g. 0 0 0)
Enter three numbers (space-separated), each from 0 to 25, representing the ring setting for each rotor. The ring setting shifts the internal wiring of the rotor. Historically, this was used to add another layer of security.
4. Plugboard pairs (e.g. AB CD)
Enter pairs of letters (no separator between letters, space between pairs) to swap on the plugboard. For example, AB CD swaps A<->B and C<->D. You can leave this blank for no plugboard swaps.
Example Session
$ node enigma.js
Enter message: HELLOWORLD
Rotor positions (e.g. 0 0 0): 0 0 0
Ring settings (e.g. 0 0 0): 0 0 0
Plugboard pairs (e.g. AB CD): QW ER
Output: ZISNQXQKGA
Notes
The machine always uses rotors I, II, and III (historical Enigma I order, rightmost rotor steps every keypress).
Only uppercase A-Z are encrypted; all other characters are output unchanged.
The same settings must be used to decrypt a message as were used to encrypt it.

## Testing

This project includes comprehensive unit tests to verify the Enigma machine implementation.

### Prerequisites
Install dependencies first:
```bash
npm install
```

### Running Tests

**Basic test execution:**
```bash
npm test
# or
node enigma.js --test
```

**Test with coverage:**
```bash
npm run test:coverage
```

**Generate HTML coverage report:**
```bash
npm run test:coverage:html
```
View the generated report by opening `coverage/index.html` in your browser.

**Generate all coverage formats:**
```bash
npm run test:coverage:all
```

### Test Coverage
- **6 comprehensive test cases** covering all major functionality
- **85.93% statement coverage** 
- **92.3% function coverage**
- **77.14% branch coverage**
- Coverage threshold set to 70% for all metrics

### Test Cases
1. Basic encryption/decryption without plugboard
2. Encryption/decryption with plugboard pairs
3. Different initial rotor positions
4. Ring settings functionality
5. Long messages (rotor stepping verification)
6. Non-alphabetic character handling

All tests verify that encryption and decryption are symmetric (encrypt → decrypt = original message).