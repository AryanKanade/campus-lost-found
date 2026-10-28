Module 1 — Item Reporting
Test Case ID Test scenario and data Expected result Actual result Status
TC-REP-01 Submit a valid LOST report with a valid email Report saved; success message and report ID displayed Success message and report ID displayed; matching record verified in MySQL. Passed
TC-REP-02 Submit a valid FOUND report with a valid phone number only Report saved with type FOUND FOUND report successfully saved using phone number only. Passed
TC-REP-03 Submit with required fields empty Inline validation errors appear; no report is saved. Validation testing Inline validation errors displayed for missing required fields; submission prevented. Passed
TC-REP-04 Enter email aryan@gmail Email error appears; report is not submitted. Equivalence partitioning Invalid email error displayed; report submission prevented. Passed
TC-REP-05 Enter phone number 12345 Phone validation error appears; report is not submitted. Boundary/invalid-value testing Phone validation error displayed for 12345; submission prevented. Passed
TC-REP-06 Try submitting a future date Future date is rejected by validation. Boundary value analysis Future date rejected by validation. Passed
TC-REP-07 Submit a valid report and query MySQL Record exists in item_reports with the submitted values. Integration testing Submitted report retrieved from MySQL with matching values. Passed
TC-REP-08	Item Reporting / API	Send malformed JSON ({invalid) to POST /api/reports with Content-Type: application/json	API returns HTTP 400 with a JSON error message and no stack trace in the response	Before fix, API returned an HTML error page with a SyntaxError stack trace. After fix, API returned HTTP 400 with a JSON error message and no stack trace in the response.	Passed
TC-REP-09	Item Reporting / API	Send a JSON request body larger than 20 KB	HTTP 413 with a JSON error message and no stack trace	HTTP 413 returned with {"message":"Request body is too large."}	Passed
TC-REP-10  HTTP 400; invalid email rejected and no record saved  HTTP 201; report ID 7 created  HTTP 400; invalid email rejected  Passed after fix



Module 2 — Browse & Search
Test Case ID Test scenario and data Expected result Actual result Status
TC-BRW-01 Open Browse Items with reports in MySQL Item cards load and the result count is displayed. Integration testing Item cards and result count loaded from the API. Passed
TC-BRW-02 Search for wallet Matching reports appear Matching reports displayed in the card view. Passed
TC-BRW-03 Select report type LOST Only LOST reports appear LOST filter returned only LOST reports. Passed
TC-BRW-04 Select FOUND and category Electronics Results match both filters Combined FOUND and Electronics filters returned matching results. Passed
TC-BRW-05 Search for an item that does not exist Friendly no-results message appears No-results message displayed for an unmatched keyword. Passed
TC-BRW-06 Apply filters and then click Clear Filters Filters reset and the complete result list reloads Clear Filters reset the fields and reloaded the full result list. Passed
TC-BRW-07 Request /api/reports?category=InvalidCategory API returns HTTP 400 with a validation message API returned HTTP 400 with a validation message for an invalid category. Passed
