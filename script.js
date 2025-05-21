/*******************************************************************************
 * CONFIGURATION VARIABLES
 * Initial settings and user preferences
 ******************************************************************************/
let myBirthDay = '2004-09-04';
let myLifeExpectancy = 79;
let totalWeeksInLife = myLifeExpectancy * 52.1429; // 52.1429 weeks per year (Gregorian calendar)

// Life modifiers settings - factors that can increase or decrease life expectancy
const lifeModifiers = {
  exercise: { enabled: false, value: 2 },
  smoking: { enabled: false, value: -5 },
  diet: { enabled: false, value: 3 }
};

// Custom life period settings - define different periods to visualize on the calendar
const customSettings = {
  academic: { start: 6, end: 23, enabled: false },
  work: { start: 23, end: 65, enabled: false },
  parents: { currentAge: 60, expectancy: 82, enabled: false },
  siblings: { currentAge: 27, expectancy: 85, enabled: false },
  grandparents: { currentAge: 81, expectancy: 85, enabled: false },
  birthdays: { enabled: false }
};

// Show predefined events setting
let showPredefinedEvents = true;

// User's special events - custom events added by the user
let specialEvents = [];

/*******************************************************************************
 * TIME CALCULATION FUNCTIONS
 * Core functions to calculate remaining lifetime in different units
 ******************************************************************************/
// Calculate weeks left in life based on birth date
function returnWeeks(birthday) {
  const bday = new Date(birthday);
  const ageDifMs = Date.now() - bday.getTime();
  return Math.ceil(totalWeeksInLife - ageDifMs / (1000 * 60 * 60 * 24 * 7));
}

// Calculate days and years passed/left with detailed statistics
function calculateTimeStats(birthday) {
  const bday = new Date(birthday);
  const ageDifMs = Date.now() - bday.getTime();
  
  // Calculate days
  const daysPassed = Math.floor(ageDifMs / (1000 * 60 * 60 * 24));
  const totalDaysInLife = Math.ceil(myLifeExpectancy * 365.25);
  const daysLeft = totalDaysInLife - daysPassed;
  
  // Calculate years with one decimal point for more precision
  const yearsPassed = (daysPassed / 365.25).toFixed(1);
  const yearsLeft = (daysLeft / 365.25).toFixed(1);
  
  return {
    daysPassed,
    daysLeft,
    totalDaysInLife,
    yearsPassed,
    yearsLeft
  };
}

/*******************************************************************************
 * STATISTICS DISPLAY
 * Functions to show time-based statistics to the user
 ******************************************************************************/
// Initialize statistics display with weeks, days and years information
function initializeStats() {
  // Calculate time statistics
  const weeksLeft = returnWeeks(myBirthDay);
  const weeksLived = Math.ceil(totalWeeksInLife) - Math.ceil(weeksLeft);
  const totalWeeks = Math.ceil(totalWeeksInLife);
  const weeksStats = `${weeksLived} weeks lived. ${weeksLeft} weeks left of all total ${totalWeeks} weeks available.`;

  const timeStats = calculateTimeStats(myBirthDay);
  const daysStats = `${timeStats.daysPassed} days lived. ${timeStats.daysLeft} days left of all total ${timeStats.totalDaysInLife} days available.`;
  const yearsStats = `${timeStats.yearsPassed} years lived. ${timeStats.yearsLeft} years left of all total ${myLifeExpectancy} years available.`;

  // Create and append stats elements to the DOM
  const statsContainer = document.getElementById('stats');
  
  const weeksleftLabel = document.createElement('p');
  weeksleftLabel.classList.add('weeksleft-label');
  weeksleftLabel.innerHTML = weeksStats;
  statsContainer.appendChild(weeksleftLabel);

  const daysleftLabel = document.createElement('p');
  daysleftLabel.classList.add('daysleft-label');
  daysleftLabel.innerHTML = daysStats;
  statsContainer.appendChild(daysleftLabel);

  const yearsleftLabel = document.createElement('p');
  yearsleftLabel.classList.add('yearsleft-label');
  yearsleftLabel.innerHTML = yearsStats;
  statsContainer.appendChild(yearsleftLabel);
}

/*******************************************************************************
 * CALENDAR UTILITIES
 * Helper functions for date calculations and grid placement
 ******************************************************************************/
// Get days in month (handling JavaScript's 0-indexed months)
function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

// Get week ID from date for consistent grid placement
// Used to map dates to specific cells in our calendar grid
function getWeekIdFromDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const dayOfMonth = date.getDate();
  
  // Get total days in the month
  const totalDaysInMonth = daysInMonth(month, year);
  
  // Divide month into 4 equal parts
  const daysPerSegment = totalDaysInMonth / 4;
  
  // Calculate which segment (1-4) this day falls into
  let weekInMonth = Math.ceil(dayOfMonth / daysPerSegment);
  
  // Safety check - ensure we don't exceed 4
  weekInMonth = Math.min(weekInMonth, 4);
  
  return `${year}-${month}-${weekInMonth}`;
}

/*******************************************************************************
 * CALENDAR GENERATION
 * Functions to build and populate the visual calendar
 ******************************************************************************/
// Create a year block for the calendar with all months and weeks
function createYearBlock(year, birthday) {
  const yearDiv = document.createElement('div');
  yearDiv.classList.add('year-wrapper');

  const title = document.createElement('h2');
  title.classList.add('year-label');
  title.innerHTML = year;
  yearDiv.appendChild(title);

  const yearCell = document.createElement('div');
  yearCell.classList.add('year-cell');
  yearDiv.appendChild(yearCell);

  const today = new Date();
  const birthDate = new Date(birthday);

  // Create 12 months per year
  for (let i = 0; i < 12; i++) {
    const monthDiv = document.createElement('div');
    monthDiv.classList.add('month-cell');
    
    // Calculate days per segment (each month has 4 segments/weeks)
    const numDaysPerSquare = daysInMonth(i+1, year) / 4;
    
    // Create 4 week segments per month
    for (let j = 0; j < 4; j++) {
      const weekDiv = document.createElement('div');
      weekDiv.id = `${year}-${i+1}-${j+1}`;
      weekDiv.classList.add('week-cell');
      
      // Calculate date for this cell
      const weekDate = new Date(year, i, Math.floor((j+1)*numDaysPerSquare));
      
      // Mark as filled if in the past
      if (weekDate <= today) {
        weekDiv.classList.add('filled');
        weekDiv.style.backgroundColor = 'var(--color-dark-gray-filled)';
        weekDiv.style.borderColor = 'var(--color-dark-gray-filled)';
      }

      // Mark as invisible if before birth
      if (weekDate < birthDate) {
        weekDiv.classList.add('invisible');
      }

      monthDiv.appendChild(weekDiv);
    }
    
    yearCell.appendChild(monthDiv);
  }

  return yearDiv;
}

// Fill calendar with year cells for the entire lifespan
function populateCalendar(birthday, numYears) {
  const root = document.getElementById('calendar');
  
  // Clear existing content
  root.innerHTML = '';

  const baseYear = birthday.getFullYear();
  
  // Create and append year blocks from birth year to end of life expectancy
  for (let i = 0; i < numYears; i++) {
    root.appendChild(createYearBlock(baseYear + i, birthday));
  }
}

/*******************************************************************************
 * LIFE EVENTS MANAGEMENT
 * Functions to add and visualize events on the calendar
 ******************************************************************************/
// Add a life event to the calendar with proper visual styling
function writeLifeEvent(lifeEvent) {
  const id = getWeekIdFromDate(lifeEvent.date);
  const weekDiv = document.getElementById(id);
  
  // Skip invalid dates or cells that are before birth
  if (!weekDiv || weekDiv.classList.contains('invisible')) {
    const y = lifeEvent.date.getFullYear();
    const m = lifeEvent.date.getMonth() + 1;
    const d = lifeEvent.date.getDate();
    
    console.error(`Event '${lifeEvent.description}' has an invalid date (${y}-${m}-${d}) - Could not find cell with ID: ${id}`);
    return;
  }
  
  // Create a unique identifier for this event to prevent duplicates
  const eventId = `${lifeEvent.description}_${lifeEvent.date.getTime()}`;
  
  // Initialize event tracking if needed
  if (!weekDiv.dataset.eventIds) {
    weekDiv.dataset.eventIds = JSON.stringify([]);
  }
  
  // Check for duplicates
  let eventIds = JSON.parse(weekDiv.dataset.eventIds);
  if (eventIds.includes(eventId)) {
    return; // Skip adding duplicate event
  }
  
  // Add event to tracking list
  eventIds.push(eventId);
  weekDiv.dataset.eventIds = JSON.stringify(eventIds);
  
  // Set tooltip text with frequency information if available
  let tooltipText = lifeEvent.description;
  if (lifeEvent.frequency) {
    const frequencyMap = {
      'once': 'Une seule fois',
      'weekly': 'Hebdomadaire',
      'monthly': 'Mensuel',
      'yearly': 'Annuel'
    };
    tooltipText += ` (${frequencyMap[lifeEvent.frequency] || 'Une seule fois'})`;
  }
  
  // Apply visual styles to the cell
  weekDiv.style.color = lifeEvent.color;
  weekDiv.style.borderColor = lifeEvent.color;
  weekDiv.style.backgroundColor = lifeEvent.color;
  
  weekDiv.classList.add('has-tooltip');
  weekDiv.dataset.tooltip = tooltipText;
  
  // Add icon if provided
  if ('icon' in lifeEvent) {
    weekDiv.insertAdjacentHTML('beforeend', lifeEvent.icon);
  }
}

// Generate recurring instances of an event based on frequency
function generateRecurringEvents(baseEvent) {
  const birthDate = new Date(myBirthDay);
  const lifeEndDate = new Date(birthDate);
  lifeEndDate.setFullYear(birthDate.getFullYear() + myLifeExpectancy);
  
  const eventDate = new Date(baseEvent.date);
  const eventsToRender = [];
  
  // Add the base event first
  eventsToRender.push({
    date: new Date(eventDate),
    name: baseEvent.name,
    description: baseEvent.name,
    color: 'var(--color-special-event)',
    frequency: baseEvent.frequency
  });
  
  // Only process recurring events if not "once"
  if (baseEvent.frequency === 'once') {
    return eventsToRender;
  }
  
  // Track weeks we've already added to avoid duplicates in the same week
  const addedWeekIds = new Set([getWeekIdFromDate(eventDate)]);
  let nextDate = new Date(eventDate);
  
  // Calculate subsequent dates based on frequency
  while (nextDate <= lifeEndDate) {
    // Advance to next occurrence based on frequency type
    if (baseEvent.frequency === 'weekly') {
      nextDate = new Date(nextDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // Add 7 days
    } 
    else if (baseEvent.frequency === 'monthly') {
      // Get the day of month to maintain
      const dayOfMonth = eventDate.getDate();
      nextDate.setMonth(nextDate.getMonth() + 1);
      
      // Handle month length differences (e.g., Jan 31 -> Feb 28)
      const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
      nextDate.setDate(Math.min(dayOfMonth, lastDayOfMonth));
    } 
    else if (baseEvent.frequency === 'yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }
    
    // Stop if we've gone beyond the end date
    if (nextDate > lifeEndDate) break;
    
    // Check if we already have an event in this week
    const weekId = getWeekIdFromDate(nextDate);
    
    if (!addedWeekIds.has(weekId)) {
      eventsToRender.push({
        date: new Date(nextDate.getTime()),
        name: baseEvent.name,
        description: baseEvent.name,
        color: 'var(--color-special-event)',
        frequency: baseEvent.frequency
      });
      
      // Mark this week as having an event
      addedWeekIds.add(weekId);
    }
  }
  
  return eventsToRender;
}

// Apply custom life periods to a week cell (academic, work, family times, etc.)
function applyLifePeriods(weekElement, birthDateObj) {
  const parts = weekElement.id.split('-'); // ID is like "YYYY-M-S"
  const cellYear = parseInt(parts[0]);
  const cellMonth_1_indexed = parseInt(parts[1]);
  const cellWeek = parseInt(parts[2]);
  
  // Get approximate date for this cell
  const weekDiv = document.getElementById(weekElement.id);
  const weekDate = new Date(cellYear, cellMonth_1_indexed - 1, 
                           Math.min(28, Math.ceil(cellWeek * daysInMonth(cellMonth_1_indexed, cellYear) / 4)));
  
  // Calculate exact age in years at this cell for period checks
  const ageInMilliseconds = weekDate.getTime() - birthDateObj.getTime();
  const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
  
  // Apply academic period (school/university)
  if (customSettings.academic.enabled && 
      ageInYears >= customSettings.academic.start && 
      ageInYears < customSettings.academic.end) {
    weekElement.classList.add('academic');
  }
  
  // Apply work period (career)
  if (customSettings.work.enabled && 
      ageInYears >= customSettings.work.start && 
      ageInYears < customSettings.work.end) {
    weekElement.classList.add('work');
  }
  
  // Apply family periods (parents, siblings, grandparents)
  const today = new Date();
  const familyMembers = ['parents', 'siblings', 'grandparents'];
  
  familyMembers.forEach(member => {
    if (customSettings[member].enabled) {
      // Calculate your current age today
      const yourCurrentAge = (today - birthDateObj) / (1000 * 60 * 60 * 24 * 365.25);
      
      // Calculate how old you were when they were born (could be negative if they're older)
      const yourAgeWhenTheyWereBorn = yourCurrentAge - customSettings[member].currentAge;
      
      // Calculate when they will reach their life expectancy
      const ageAtTheirEnd = yourAgeWhenTheyWereBorn + customSettings[member].expectancy;
      
      // Apply to weeks where your age is between when they were born (or your birth if they're older) 
      // and when they will reach their life expectancy
      const startAge = Math.max(0, yourAgeWhenTheyWereBorn); // Can't be negative - you weren't alive yet
      
      if (ageInYears >= startAge && ageInYears < ageAtTheirEnd) {
        weekElement.classList.add(member);
      }
    }
  });

  // Check if it's a birthday week - highlights birthdays throughout life
  if (customSettings.birthdays.enabled) {
    const birthMonth_0_indexed = birthDateObj.getMonth(); 
    const birthDayOfMonth = birthDateObj.getDate();
    
    // Check if this cell falls in the birthday week
    if (cellMonth_1_indexed - 1 === birthMonth_0_indexed) {
      const daysPerSegment = daysInMonth(cellMonth_1_indexed, cellYear) / 4;
      const startDay = Math.floor((cellWeek - 1) * daysPerSegment) + 1;
      const endDay = Math.floor(cellWeek * daysPerSegment);
      
      if (birthDayOfMonth >= startDay && birthDayOfMonth <= endDay) {
        weekElement.classList.add('birthday');
        weekElement.classList.add('has-tooltip');
        weekElement.dataset.tooltip = 'Birthday';
      }
    }
  }
}

// Render all events (predefined and special) on the calendar
function renderAllCalendarEvents() {
  // Apply predefined events
  if (showPredefinedEvents && predefinedEvents.length > 0) {
    predefinedEvents.forEach(event => {
      writeLifeEvent(event);
    });
  }

  // Apply user-defined special events
  specialEvents.forEach(userEvent => {
    const allInstances = generateRecurringEvents(userEvent);
    allInstances.forEach(instance => {
      writeLifeEvent({
        date: instance.date,
        description: instance.description,
        color: instance.color,
        frequency: instance.frequency
      });
    });
  });
}

/*******************************************************************************
 * UI COMPONENTS
 * Functions to manage UI elements like the legend and events list
 ******************************************************************************/
// Update the legend based on active periods
function updateLegend() {
  const legendContainer = document.getElementById('legend-container');
  const legendItems = document.querySelector('.legend-items');
  
  // Clear existing legend items
  legendItems.innerHTML = '';
  
  // Create legend items based on active periods
  const legendData = [];
  
  // Birthday legend item
  if (customSettings.birthdays.enabled) {
    legendData.push({
      color: 'var(--color-birthday)',
      label: 'Semaines d\'anniversaire'
    });
  }
  
  // Special events legend item
  if (specialEvents.length > 0 || showPredefinedEvents) {
    legendData.push({
      color: 'var(--color-special-event)',
      label: 'Événements spéciaux'
    });
  }
  
  // Life periods legend
  const periods = [
    { setting: 'academic', label: 'Période académique', color: 'var(--color-academic)' },
    { setting: 'work', label: 'Période de travail', color: 'var(--color-work)' },
    { setting: 'parents', label: 'Temps avec parents', color: 'var(--color-parents)' },
    { setting: 'siblings', label: 'Temps avec fratrie', color: 'var(--color-siblings)' },
    { setting: 'grandparents', label: 'Temps avec grands-parents', color: 'var(--color-grandparents)' }
  ];
  
  periods.forEach(period => {
    if (customSettings[period.setting].enabled) {
      legendData.push({
        color: period.color,
        label: period.label
      });
    }
  });
  
  // Hide legend if no active periods
  if (legendData.length === 0) {
    legendContainer.style.display = 'none';
    return;
  }
  
  // Show and populate legend
  legendContainer.style.display = 'block';
  
  legendData.forEach(item => {
    const legendItem = document.createElement('div');
    legendItem.classList.add('legend-item');
    
    const colorBox = document.createElement('div');
    colorBox.classList.add('legend-color');
    colorBox.style.backgroundColor = item.color;
    
    const label = document.createElement('span');
    label.textContent = item.label;
    
    legendItem.appendChild(colorBox);
    legendItem.appendChild(label);
    legendItems.appendChild(legendItem);
  });
}

// Update events list in the UI
function updateEventsList() {
  const eventsList = document.getElementById('events-list');
  eventsList.innerHTML = '';
  
  // Frequency display mapping
  const frequencyMap = {
    'once': 'Une seule fois',
    'weekly': 'Hebdomadaire',
    'monthly': 'Mensuel',
    'yearly': 'Annuel'
  };
  
  // Create list items for each special event
  specialEvents.forEach((event, index) => {
    const eventItem = document.createElement('div');
    eventItem.classList.add('event-item');
    
    const eventInfo = document.createElement('div');
    eventInfo.classList.add('event-info');
    
    const eventText = document.createElement('span');
    eventText.textContent = `${event.name} - ${new Date(event.date).toLocaleDateString()}`;
    
    const frequencyText = document.createElement('span');
    frequencyText.classList.add('event-frequency');
    frequencyText.textContent = frequencyMap[event.frequency] || 'Une seule fois';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Supprimer';
    deleteBtn.addEventListener('click', function() {
      specialEvents.splice(index, 1);
      updateEventsList();
    });
    
    eventInfo.appendChild(eventText);
    eventInfo.appendChild(frequencyText);
    
    eventItem.appendChild(eventInfo);
    eventItem.appendChild(deleteBtn);
    eventsList.appendChild(eventItem);
  });
}

/*******************************************************************************
 * PREDEFINED EVENTS
 * List of example life events
 ******************************************************************************/
// List of predefined life events to display on the calendar
const predefinedEvents = [
  {
    'date': new Date('2007-07-02'),
    'description': 'Lorem ipsum dolor sit amet.',
    'color': '#18aedb',
  },
  {
    'date': new Date('2007-06-01'),
    'description': 'Consectetur adipiscing elit.',
    'color': '#f8312f',
    'icon': '❤️',
  },
  {
    'date': new Date('2007-06-11'),
    'description': 'Sed do eiusmod tempor.',
    'color': '#18aedb',
  },
  {
    'date': new Date('2007-12-25'),
    'description': 'Incididunt ut labore et dolore.',
    'color': '#f8f806',
  },
  {
    'date': new Date('2008-06-01'),
    'description': 'Magna aliqua ut enim ad.',
    'color': '#f8f806',
  },
  {
    'date': new Date('2009-03-30'),
    'description': 'Minim veniam quis nostrud.',
    'color': '#3ef806',
  },
  {
    'date': new Date('2009-09-07'),
    'description': 'Exercitation ullamco laboris nisi.',
    'color': '#18aedb',
  },
  {
    'date': new Date('2010-03-16'),
    'description': 'Ut aliquip ex ea commodo.',
    'color': '#222222',
  },
  {
    'date': new Date('2010-03-30'),
    'description': 'Duis aute irure dolor in.',
    'color': '#f8f806',
  },
  {
    'date': new Date('2010-12-07'),
    'description': 'Reprehenderit in voluptate velit.',
    'color': '#18aedb',
  },
  {
    'date': new Date('2013-05-02'),
    'description': 'Esse cillum dolore eu fugiat.',
    'color': '#f8f806',
  },
  {
    'date': new Date('2013-08-26'),
    'description': 'Nulla pariatur excepteur sint.',
    'color': '#3ef806',
  },
  {
    'date': new Date('2013-05-22'),
    'description': 'Occaecat cupidatat non proident.',
    'color': '#18aedb',
  },
  {
    'date': new Date('2015-08-01'),
    'description': 'Sunt in culpa qui officia.',
    'color': '#f8f806',
  },
  {
    'date': new Date('2008-03-28'),
    'description': 'Deserunt mollit anim id est.',
    'color': '#f8312f',
    'icon': '❤️',
  },
  {
    'date': new Date('2008-07-02'),
    'description': 'Laborum lorem ipsum dolor.',
    'color': '#f8312f',
    'icon': '❤️',
  },
  {
    'date': new Date('2018-02-07'),
    'description': 'Sit amet consectetur elit.',
    'color': '#f8312f',
    'icon': '❤️',
  },
  {
    'date': new Date('2019-01-15'),
    'description': 'Adipiscing elit sed do.',
    'color': '#222222',
    'icon': '💀',
  },
  {
    'date': new Date('2020-08-09'),
    'description': 'Eiusmod tempor incididunt ut.',
    'color': '#f88b06',
  },
  {
    'date': new Date('2020-09-10'),
    'description': 'Labore et dolore magna.',
    'color': '#f88b06',
  },
  {
    'date': new Date('2022-07-21'),
    'description': 'Aliqua ut enim ad minim.',
    'color': '#f88b06',
  },
  {
    'date': new Date('2022-08-01'),
    'description': 'Veniam quis nostrud exercitation.',
    'color': '#f8f806',
  },
  {
    'date': new Date('2023-05-22'),
    'description': 'Ullamco laboris nisi ut.',
    'color': '#18aedb',
  },
  {
    'date': new Date('2025-05-21'),
    'description': 'Fin Cerisier',
    'color': '#18aedb',
    'icon': '🍒',
  },
];

/*******************************************************************************
 * APPLICATION INITIALIZATION
 * Functions to initialize and set up the application
 ******************************************************************************/
// Initialize application - main startup function
function initializeApp() {
  // Generate stats
  initializeStats();
  
  // Create the calendar
  populateCalendar(new Date(myBirthDay), myLifeExpectancy);
  
  // Render events
  renderAllCalendarEvents();
  
  // Apply life periods to all visible cells
  const birthDate = new Date(myBirthDay);
  document.querySelectorAll('.week-cell').forEach(weekCell => {
    if (!weekCell.classList.contains('invisible')) {
      applyLifePeriods(weekCell, birthDate);
    }
  });
  
  // Update legend
  updateLegend();
}

/*******************************************************************************
 * EVENT HANDLERS
 * Functions to handle user interactions with form controls
 ******************************************************************************/
// Set up event handlers once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Toggle options panel visibility
  const toggleBtn = document.getElementById('toggle-options');
  const optionsContainer = document.querySelector('.options-container');
  const optionsPanel = document.querySelector('.options-panel');
  
  toggleBtn.addEventListener('click', function() {
    const wasHidden = optionsContainer.classList.contains('hidden');
    optionsContainer.classList.toggle('hidden');
    toggleBtn.textContent = optionsContainer.classList.contains('hidden') 
      ? 'Afficher les options' 
      : 'Masquer les options';
    
    // Scroll to panel when opened for better UX
    if (wasHidden) {
      setTimeout(() => {
        optionsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  });
  
  // Force dark theme
  document.documentElement.setAttribute('data-theme', 'dark');
  
  // Set default values in form fields
  if (document.getElementById('custom-birthdate')) {
    document.getElementById('custom-birthdate').value = myBirthDay;
  }
  
  if (document.getElementById('life-expectancy')) {
    document.getElementById('life-expectancy').value = myLifeExpectancy;
  }
  
  // Set up modifier toggles (exercise, smoking, diet)
  document.querySelectorAll('.modifier-toggle').forEach(toggle => {
    toggle.addEventListener('change', function() {
      const modifierName = this.id.replace('-toggle', '');
      const valueInput = document.getElementById(`${modifierName}-modifier`);
      const modifierValueDiv = valueInput.closest('.period-value');
    
      lifeModifiers[modifierName].enabled = this.checked;
      valueInput.disabled = !this.checked;
      if (modifierValueDiv) {
        modifierValueDiv.style.display = this.checked ? 'block' : 'none';
      }
    });
  });
  
  // Set up period toggles (academic, work, family time, etc.)
  document.querySelectorAll('.period-toggle').forEach(toggle => {
    toggle.addEventListener('change', function() {
      const periodName = this.id.replace('-toggle', '');
      const periodValues = this.parentElement.parentElement.querySelector('.period-value');
      
      if (customSettings[periodName]) {
        customSettings[periodName].enabled = this.checked;
      }
      
      if (periodValues) {
        periodValues.style.display = this.checked ? 'block' : 'none';
      }
    });
  });
  
  // Set up predefined events toggle
  const showPredefinedEventsToggle = document.getElementById('show-predefined-events');
  if (showPredefinedEventsToggle) {
    showPredefinedEventsToggle.checked = showPredefinedEvents;
    showPredefinedEventsToggle.addEventListener('change', function() {
      showPredefinedEvents = this.checked;
    });
  }
  
  // Set up add event button
  document.getElementById('add-event-btn').addEventListener('click', function() {
    const eventName = document.getElementById('event-name').value;
    const eventDate = document.getElementById('event-date').value;
    const eventFrequency = document.getElementById('event-frequency').value;
    
    if (eventName && eventDate) {
      specialEvents.push({
        name: eventName,
        date: eventDate,
        frequency: eventFrequency
      });
      
      updateEventsList();
      
      // Reset form fields after adding
      document.getElementById('event-name').value = '';
      document.getElementById('event-date').value = '';
      document.getElementById('event-frequency').value = 'once';
    } else {
      alert('Veuillez remplir tous les champs');
    }
  });
  
  // Set up apply settings button
  document.getElementById('apply-settings').addEventListener('click', function() {
    // Update birth date and life expectancy
    myBirthDay = document.getElementById('custom-birthdate').value;
    const baseLifeExpectancy = parseInt(document.getElementById('life-expectancy').value);
    
    // Update life modifiers
    lifeModifiers.exercise.value = parseInt(document.getElementById('exercise-modifier').value) || 0;
    lifeModifiers.smoking.value = parseInt(document.getElementById('smoking-modifier').value) || 0;
    lifeModifiers.diet.value = parseInt(document.getElementById('diet-modifier').value) || 0;
    
    // Calculate total life expectancy with enabled modifiers
    let totalModifier = 0;
    for (const mod in lifeModifiers) {
      if (lifeModifiers[mod].enabled) {
        totalModifier += lifeModifiers[mod].value;
      }
    }
    
    myLifeExpectancy = baseLifeExpectancy + totalModifier;
    totalWeeksInLife = myLifeExpectancy * 52.1429;
    
    // Update custom settings
    if (customSettings.academic.enabled) {
      customSettings.academic.start = parseInt(document.getElementById('academic-start').value);
      customSettings.academic.end = parseInt(document.getElementById('academic-end').value);
    }
    
    if (customSettings.work.enabled) {
      customSettings.work.start = parseInt(document.getElementById('work-start').value);
      customSettings.work.end = parseInt(document.getElementById('work-end').value);
    }
    
    if (customSettings.parents.enabled) {
      customSettings.parents.currentAge = parseInt(document.getElementById('parents-age').value);
      customSettings.parents.expectancy = parseInt(document.getElementById('parents-expectancy').value);
    }
    
    if (customSettings.siblings.enabled) {
      customSettings.siblings.currentAge = parseInt(document.getElementById('siblings-age').value);
      customSettings.siblings.expectancy = parseInt(document.getElementById('siblings-expectancy').value);
    }
    
    if (customSettings.grandparents.enabled) {
      customSettings.grandparents.currentAge = parseInt(document.getElementById('grandparents-age').value);
      customSettings.grandparents.expectancy = parseInt(document.getElementById('grandparents-expectancy').value);
    }
    
    // Update predefined events setting
    showPredefinedEvents = document.getElementById('show-predefined-events').checked;
    
    // Update stats
    document.getElementById('stats').innerHTML = '';
    initializeStats();
    
    // Regenerate calendar
    populateCalendar(new Date(myBirthDay), myLifeExpectancy);
    
    // Apply events and periods
    renderAllCalendarEvents();
    
    const birthDateForPeriods = new Date(myBirthDay);
    document.querySelectorAll('.week-cell').forEach(weekCell => {
      if (!weekCell.classList.contains('invisible')) {
        applyLifePeriods(weekCell, birthDateForPeriods);
      }
    });
    
    updateLegend();
  });
  
  // Initialize toggle states based on current settings
  document.querySelectorAll('.modifier-toggle').forEach(toggle => {
    const modifierName = toggle.id.replace('-toggle', '');
    const valueInput = document.getElementById(`${modifierName}-modifier`);
    const modifierValueDiv = valueInput.closest('.period-value');

    if (lifeModifiers[modifierName]) {
      toggle.checked = lifeModifiers[modifierName].enabled;
    }
    
    valueInput.disabled = !toggle.checked;
    if (modifierValueDiv) {
      modifierValueDiv.style.display = toggle.checked ? 'block' : 'none';
    }
  });
  
  document.querySelectorAll('.period-toggle').forEach(toggle => {
    const periodName = toggle.id.replace('-toggle', '');
    const periodValues = toggle.parentElement.parentElement.querySelector('.period-value');
    
    if (customSettings[periodName]) {
      toggle.checked = customSettings[periodName].enabled;
    }
    
    if (periodValues) {
      periodValues.style.display = toggle.checked ? 'block' : 'none';
    }
  });
  
  // Initialize app
  initializeApp();
});
