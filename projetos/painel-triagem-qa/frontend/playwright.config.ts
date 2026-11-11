import { defineConfig } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4200',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : {},
  },
  webServer: [
    {
      command: 'dotnet run --project ../backend/Triagem.Api.csproj --no-launch-profile',
      url: 'http://127.0.0.1:5086/api/bugs',
      timeout: 90000,
      env: { Triage__DbPath: join(tmpdir(), 'painel-qa-' + randomUUID() + '.db') },
    },
    {
      command: 'npm start',
      url: 'http://127.0.0.1:4200',
      timeout: 90000,
    },
  ],
});
