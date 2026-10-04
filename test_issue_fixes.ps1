$baseUrl = "http://localhost:8080/api"
$runId = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "TESTING 3 ISSUES VERIFICATION" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# -------------------------------------------------------------
# ISSUE 3: Create event with custom category (e.g., "Cleaning", "NGO", "Games")
# -------------------------------------------------------------
Write-Host "`n[ISSUE 3 TEST] Creating event with custom category 'Cleaning'..." -ForegroundColor Yellow
$eventPayload = @{
    title = "City Clean & Green Drive $runId"
    tagline = "Community cleaning and environmental awareness"
    description = "Mass volunteer cleanup initiative"
    date = "Nov 20, 2026"
    venue = "Riverside Park Ground"
    category = "Cleaning"
    capacity = 10
    resourceName = "Cleaning Kits & Gloves"
    resourceQuantity = 2 # Initial stock only 2
} | ConvertTo-Json

$createdEvent = Invoke-RestMethod -Uri "$baseUrl/events" -Method Post -Body $eventPayload -ContentType "application/json"
if ($createdEvent.success -and $createdEvent.data.category -eq "Cleaning") {
    Write-Host " [PASS] Event created successfully with custom category '$($createdEvent.data.category)'!" -ForegroundColor Green
} else {
    Write-Host " [FAIL] Could not create event with custom category" -ForegroundColor Red
    exit 1
}

$testEventId = $createdEvent.data.id

# -------------------------------------------------------------
# ISSUE 2 TEST: Confirmed attendees booked when resource count is insufficient,
# then resource count is increased -> MUST automatically assign to confirmed attendees!
# -------------------------------------------------------------
Write-Host "`n[ISSUE 2 TEST] Registering 4 confirmed attendees for the event..." -ForegroundColor Yellow
for ($i = 1; $i -le 4; $i++) {
    $attendeePayload = @{
        eventId = $testEventId
        name = "Volunteer $i"
        email = "vol$i`_$runId@test.com"
        phone = "+1 555-010$i"
        section = "Riverside Park Ground"
    } | ConvertTo-Json

    $reg = Invoke-RestMethod -Uri "$baseUrl/registrations" -Method Post -Body $attendeePayload -ContentType "application/json"
    Write-Host "   Attendee $i registered: Status = $($reg.data.status)" -ForegroundColor Gray
}

# Fetch resources for this event
$resList = Invoke-RestMethod -Uri "$baseUrl/resources?eventId=$testEventId" -Method Get
$cleanKit = $resList.data[0]
Write-Host "`nCurrent Resource State before increasing count:" -ForegroundColor Magenta
Write-Host "   Resource: $($cleanKit.name)" -ForegroundColor Gray
Write-Host "   Total Stock: $($cleanKit.total)" -ForegroundColor Gray
Write-Host "   Allocated: $($cleanKit.allocated)" -ForegroundColor Gray
Write-Host "   Confirmed Guests: $($cleanKit.confirmedCount)" -ForegroundColor Gray
Write-Host "   Needed More (Shortage): $($cleanKit.neededMore)" -ForegroundColor Gray
Write-Host "   Allocated Attendees count: $($cleanKit.allocatedAttendees.Count)" -ForegroundColor Gray
Write-Host "   Unallocated Attendees count: $($cleanKit.unallocatedAttendees.Count)" -ForegroundColor Gray

if ($cleanKit.total -eq 2 -and $cleanKit.allocated -eq 2 -and $cleanKit.neededMore -eq 2) {
    Write-Host " [PASS] Correctly shows 2 allocated and 2 needed more (shortage)!" -ForegroundColor Green
} else {
    Write-Host " [FAIL] Expected 2 allocated and 2 needed more." -ForegroundColor Red
    exit 1
}

# NOW INCREASE RESOURCE COUNT from 2 to 5!
Write-Host "`nIncreasing resource total count from 2 to 5..." -ForegroundColor Yellow
$updatePayload = @{
    name = $cleanKit.name
    category = $cleanKit.category
    total = 5
} | ConvertTo-Json

$updateRes = Invoke-RestMethod -Uri "$baseUrl/resources/$($cleanKit.id)" -Method Put -Body $updatePayload -ContentType "application/json"

Write-Host "Resource State after increasing count to 5:" -ForegroundColor Magenta
Write-Host "   Resource: $($updateRes.data.name)" -ForegroundColor Gray
Write-Host "   New Total: $($updateRes.data.total)" -ForegroundColor Gray
Write-Host "   New Allocated: $($updateRes.data.allocated)" -ForegroundColor Gray
Write-Host "   Needed More: $($updateRes.data.neededMore)" -ForegroundColor Gray
Write-Host "   Allocated Attendees count: $($updateRes.data.allocatedAttendees.Count)" -ForegroundColor Gray
Write-Host "   Unallocated Attendees count: $($updateRes.data.unallocatedAttendees.Count)" -ForegroundColor Gray
Write-Host "   Server Message: $($updateRes.message)" -ForegroundColor Cyan

if ($updateRes.data.allocated -eq 4 -and $updateRes.data.neededMore -eq 0 -and $updateRes.data.allocatedAttendees.Count -eq 4) {
    Write-Host " [PASS] Increasing resource count AUTOMATICALLY assigned to all confirmed attendees!" -ForegroundColor Green
} else {
    Write-Host " [FAIL] Resource count increase did not assign to confirmed attendees." -ForegroundColor Red
    exit 1
}

# -------------------------------------------------------------
# ISSUE 1 TEST: Verify resource details breakdown (allocated list & shortage list)
# -------------------------------------------------------------
Write-Host "`n[ISSUE 1 TEST] Checking breakdown fields returned for resource..." -ForegroundColor Yellow
if ($updateRes.data.allocatedAttendees -ne $null -and $updateRes.data.allocatedAttendees.Count -ge 4) {
    Write-Host "   Allocated To Whom: $($updateRes.data.allocatedAttendees.name -join ', ')" -ForegroundColor Gray
    Write-Host " [PASS] 'to whom' allocated attendees list correctly populated!" -ForegroundColor Green
} else {
    Write-Host " [FAIL] 'allocatedAttendees' missing or empty." -ForegroundColor Red
    exit 1
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "ALL BACKEND TESTS PASSED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
