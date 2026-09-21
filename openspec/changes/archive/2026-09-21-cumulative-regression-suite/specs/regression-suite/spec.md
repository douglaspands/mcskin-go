# Spec Delta

## Purpose

Defines how mcskin's web UI regression testing accumulates coverage across features, validating both functional behavior and visual appearance, and guaranteeing every screen component remains present, functional, and correctly positioned after each change.

## ADDED Requirements

### Requirement: Cumulative Test Accumulation
The regression suite SHALL grow by accumulation: each change that alters or adds UI behavior MUST add at least one new regression test to the suite, and all previously added tests MUST continue to execute on every subsequent regression run, so removing a passing test requires an explicit, documented justification rather than silent deletion.

#### Scenario: New feature adds a regression test
- **WHEN** a change modifies or adds behavior in the web UI
- **THEN** the change's tasks include adding at least one new automated regression test file to the suite, and that file remains part of the suite after the change is archived

#### Scenario: Existing tests still run after a new feature lands
- **WHEN** the regression suite is executed after a new feature's tests are added
- **THEN** every regression test added by prior features executes in the same run, not only the tests added by the newest change

### Requirement: Behavioral Regression Coverage
The regression suite SHALL validate observable functional behavior of the web UI (user interactions, state transitions, and DOM presence of interactive controls) through an automated, scriptable browser-driven test, independent of manual verification.

#### Scenario: Interaction behavior verified automatically
- **WHEN** the regression suite runs
- **THEN** each covered interactive control (e.g. mode switches, tool selection, palette actions) is exercised programmatically and its resulting state change is asserted without requiring a human to click through the UI

### Requirement: Visual Appearance Regression Coverage
The regression suite SHALL validate the visual appearance of the web UI by comparing rendered screenshots against versioned baseline images, flagging any difference beyond a defined tolerance as a regression failure.

#### Scenario: Visual baseline established for a new screen state
- **WHEN** a change introduces a new screen state or view without an existing visual baseline
- **THEN** the suite captures a baseline screenshot for that state and stores it as part of the suite's versioned baselines, so future runs compare against it

#### Scenario: Unintended visual drift detected
- **WHEN** a subsequent change alters the rendered pixels of a screen state beyond the defined tolerance without deliberately updating its baseline
- **THEN** the regression run reports that visual state as failing and identifies which screen state diverged

### Requirement: Component Inventory & Placement Gate
At the end of every regression run, the suite SHALL verify that every screen component registered in the component inventory still exists in the DOM, remains interactable, and is positioned within its expected screen region across desktop, tablet, and mobile viewports.

#### Scenario: All components present and positioned correctly
- **WHEN** a regression run completes successfully
- **THEN** every registered component's presence, interactability, and bounding position have been checked, and the run's report confirms none are missing, non-functional, or displaced

#### Scenario: A component is missing or displaced
- **WHEN** a regression run finds a registered component absent, non-interactable, or outside its expected screen region
- **THEN** the run fails and names the specific component and viewport where the discrepancy occurred

#### Scenario: Cross-viewport component check
- **WHEN** the component inventory gate runs
- **THEN** it checks component presence and placement at desktop, tablet, and mobile viewport widths, matching the responsive breakpoints already defined for the application

### Requirement: Regression Gate in the Change Lifecycle
The full accumulated regression suite SHALL run and pass before a change proceeds from implementation to PO/QA sign-off, so that no change is archived while a prior feature's behavior or appearance has silently regressed.

#### Scenario: Regression run precedes QA sign-off
- **WHEN** a change's implementation tasks are complete
- **THEN** the full accumulated regression suite executes and passes before the PO/QA review step evaluates the change

#### Scenario: Regression failure blocks sign-off
- **WHEN** the accumulated regression suite reports any failure
- **THEN** the change is not presented for PO/QA sign-off until the failure is resolved or a deliberate baseline update is made and justified

### Requirement: Token-Economical Regression Reporting
The regression suite's execution SHALL be silent-on-success and surface only actionable failure detail, consistent with the project's compact test-reporting convention, regardless of the underlying test runner.

#### Scenario: All regression tests passing
- **WHEN** the regression suite executes and every test passes
- **THEN** the output is a single compact summary line, without per-test verbose logs or full HTML reports printed to the console

#### Scenario: Regression failure reporting
- **WHEN** one or more regression tests fail
- **THEN** the output names only the failing test, the affected component or screen state, and a reference to the diff artifact (e.g. an image path), without reproducing full passing-test output

### Requirement: Cross-Platform Regression Execution
The regression suite SHALL execute successfully on both Linux and Windows development environments, using the project's configured runtime toolchain without requiring OS-specific manual steps.

#### Scenario: Running on Linux
- **WHEN** the regression suite is executed on a Linux development machine
- **THEN** all behavioral, visual, and component-inventory checks run to completion using the project's Linux-available browser and toolchain

#### Scenario: Running on Windows
- **WHEN** the regression suite is executed on a Windows development machine
- **THEN** all behavioral, visual, and component-inventory checks run to completion without requiring commands unavailable on Windows
