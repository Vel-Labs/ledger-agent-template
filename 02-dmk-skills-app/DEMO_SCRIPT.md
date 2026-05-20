# Demo Script

1. From the `Agent-Demos` root, run `npm run demo:dmk`.
2. Open `http://127.0.0.1:8022/`.
3. Show that "Publish setting" is blocked while Ledger validation is pending.
4. Click "Run Ledger validation."
5. Confirm the dry-run message-signing prompt on the connected Ledger.
6. Show the validation receipt in the UI.
7. Click "Simulate Ledger approval."
8. Click "Publish setting."
9. Show the approval receipt.
10. Open `fixtures/install-plan.json` and explain that a real DMK build would replace the local adapter with the official integration.
11. State clearly that this scaffold does not claim DMK verifies WebAuthn.
