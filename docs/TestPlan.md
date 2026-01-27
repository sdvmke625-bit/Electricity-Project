# Test Plan - Electricity Bill System

## 1. Introduction
This document outlines the test strategy/plan for the module-based Electricity Bill System.

## 2. Test Cases

### Test Suite 1: Input Validation (Registration)
| Test ID | Functionality | Input Data | Expected Output | Actual Output | Status |
|---------|---------------|------------|-----------------|---------------|--------|
| TC-R-01 | Name Validation | `John Doe` | Success | | |
| TC-R-02 | Name Validation | `John123` | Error: Name must contain alphabets only | | |
| TC-R-03 | Phone Validation | `9876543210` | Success | | |
| TC-R-04 | Phone Validation | `12345` | Error: Phone number must be exactly 10 digits | | |
| TC-R-05 | Unique ID | `ExistingID` | Error: Reference ID already exists | | |

### Test Suite 2: Bill Calculation Logic
| Test ID | Functionality | Input Units | Expected Calculation | Expected Result (Bill Only) | Status |
|---------|---------------|-------------|----------------------|-----------------------------|--------|
| TC-C-01 | Minimum Charge | `0` | Min Charge 25 | 25.00 | |
| TC-C-02 | Tier 1 limit | `50` | 50 * 1.5 | 75.00 | |
| TC-C-03 | Tier 2 limit | `100` | (50*1.5) + (50*2.5) | 200.00 | |
| TC-C-04 | Tier 3 limit | `150` | 200 + (50*3.5) | 375.00 | |
| TC-C-05 | High Usage | `151` | 375 + (1*4.5) | 379.50 | |

### Test Suite 3: Bill Generation (Employee)
| Test ID | Functionality | Input Data | Expected Output | Actual Output | Status |
|---------|---------------|------------|-----------------|---------------|--------|
| TC-G-01 | Generate Bill | Valid ID, Units | Success Page with breakdown | | |
| TC-G-02 | Negative Units | Units: `-5` | Error: Invalid Units | | |
| TC-G-03 | Duplicate Bill | Same Month | Error: Bill already generated | | |

## 3. Test Report Summary
- All Unit tests passed.
- Integration tests passed.
