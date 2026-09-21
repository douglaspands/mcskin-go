import type { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';

interface Failure {
  title: string;
  componentOrState: string;
  diffImagePath?: string;
}

export default class CompactReporter implements Reporter {
  private passedCount = 0;
  private failures: Failure[] = [];

  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status === 'passed') {
      this.passedCount++;
      return;
    }
    if (result.status === 'skipped') return;

    const diffAttachment = result.attachments.find((a) => a.name.endsWith('-diff'));
    const viewport = test.parent.project()?.name ?? 'unknown';
    this.failures.push({
      title: `[${viewport}] ${test.titlePath().slice(3).join(' › ')}`,
      componentOrState: test.title,
      diffImagePath: diffAttachment?.path,
    });
  }

  onEnd(result: FullResult): void {
    if (this.failures.length === 0) {
      console.log(`PASS: ${this.passedCount} regression checks OK`);
      return;
    }

    console.log(`FAIL: ${this.failures.length} of ${this.passedCount + this.failures.length} regression checks failed`);
    for (const failure of this.failures) {
      const diffLine = failure.diffImagePath ? ` | diff: ${failure.diffImagePath}` : '';
      console.log(`  ✗ ${failure.title}${diffLine}`);
    }
  }
}
