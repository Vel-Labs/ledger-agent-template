# Demo Script

1. Start a localhost server with `python3 -m http.server 8003`.
2. Open `http://localhost:8003/src/`.
3. Point out that the page is open but no authenticated session exists.
4. Unlock the Ledger and open the Security Key app.
5. Click "Register or sign in with Security Key" and approve the device prompt.
6. After the session opens, click "Run Ledger validation" and approve the device prompt.
7. Show that the agent still cannot release the secret; it can only request it.
8. Click "Agent requests secret."
9. Click "Approve secret access" and approve the fresh device prompt.
10. Show the human summary and Agent JSON receipt, including `agentCreatedSession: false` and `webAuthnServerVerified: false`.
