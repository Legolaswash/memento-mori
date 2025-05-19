// Set up vars
let myBirthDay = '2004-09-04';
let myLifeExpectancy = 80;
let totalWeeksInLife = myLifeExpectancy * 52.1429; // As per the modern Gregorian calendar, one year is equal to 365 days which is 52.1429 weeks in total

// Life modifiers settings
let lifeModifiers = {
  exercise: {
    enabled: false, // Changed to false
    value: 2
  },
  smoking: {
    enabled: false, // Changed to false
    value: -5
  },
  diet: {
    enabled: false, // Changed to false
    value: 3
  }
};

// Custom life period settings - Tous les enabled à false par défaut
let customSettings = {
  academic: {
    start: 6, // age in years
    end: 23,  // age in years
    enabled: false
  },
  work: {
    start: 23, // age in years
    end: 65,   // age in years
    enabled: false
  },
  parents: {
    currentAge: 60,
    expectancy: 85,
    enabled: false
  },
  siblings: {
    currentAge: 30,
    expectancy: 82,
    enabled: false
  },
  grandparents: {
    currentAge: 80,
    expectancy: 90,
    enabled: false
  },
  birthdays: { // Added birthdays to customSettings
    enabled: false
  }
};

// Show predefined events setting
let showPredefinedEvents = true;

// User's special events
let specialEvents = [];

/*
  Calculate your life expectency

  Specific enough: https://www.blueprintincome.com/tools/life-expectancy-calculator-how-long-will-i-live/
  More specific (needs an account): https://livingto100.com/calculator/age
*/

// Weeks left in life
function returnWeeks(birthday) {
  bday = new Date(birthday);
  var ageDifMs = Date.now() - bday.getTime();
  yearOfBirth = bday.getFullYear();
  birthdayDate = bday;

  return Math.ceil(totalWeeksInLife - ageDifMs / (1000 * 60 * 60 * 24 * 7));
}

// Get how many weeks are left
weeksLeft = returnWeeks(myBirthDay);
progress = Math.ceil(totalWeeksInLife) - Math.ceil(weeksLeft) + ' weeks lived. ' + weeksLeft + ' weeks left of all total ' + Math.ceil(totalWeeksInLife) + ' weeks available.';

// Fill calendar with year cells
function populate_calendar(birthday, numYears) {
  const root = document.getElementById('calendar');

  // Remove every existing child first, just in case
  while(root.children.length > 0) {
    root.children[0].remove();
  }

  let baseYear = birthday.getFullYear();
  // Spawn years
  for (let i = 0; i < numYears; i++) {
    root.appendChild(spawn_year(baseYear + i, birthday));
  }
}

// Stats
var weeksleft_label = document.createElement('p');
weeksleft_label.classList.add('weeksleft-label');
weeksleft_label.innerHTML = progress;
document.getElementById('stats').appendChild(weeksleft_label);

function spawn_year(_year, birthday) {
  let year_div = document.createElement('div');
  year_div.classList.add('year-wrapper');

  let title = document.createElement('h2');
  title.classList.add('year-label');
  title.innerHTML = _year;
  year_div.appendChild(title);

  let year_cell = document.createElement('div');
  year_cell.classList.add('year-cell');
  year_div.appendChild(year_cell);

  for(let i = 0; i < 12; i++) {
    let month_div = document.createElement('div');

    month_div.classList.add('month-cell');
    let num_days_per_square = days_in_month(i+1, _year) / 4
      for(let j = 0; j < 4; j++) {
        week_div = document.createElement('div');
        week_div.id = `${_year}-${i+1}-${j+1}`;
        week_div.classList.add('week-cell');
        // week_date_epoch = new Date(`${_year}-${i+1}-${(j==0 ? 1 : Math.floor(j*num_days_per_square))}`).getTime();
        // today_epoch = new Date().getTime();

        // Ditch epochs because of mobile Safari and use normal dates instead
        week_date = new Date(_year, i, Math.floor((j+1)*num_days_per_square));
        today = new Date();

        // Use <= to fill the first week cell on the first day of a month
        if (week_date <= today) {
          week_div.classList.add('filled');
          week_div.style.backgroundColor = 'var(--color-dark-gray-filled)';
          week_div.style.borderColor = 'var(--color-dark-gray-filled)';
        }

        let _ = new Date(_year, i, Math.floor((j+1)*num_days_per_square));

        if (new Date(_year, i, Math.floor((j+1)*num_days_per_square)) < birthday) {
            week_div.classList.add('invisible');
        }

        month_div.appendChild(week_div);
    }
    year_cell.appendChild(month_div);
  }

  return year_div;
}

// Month in JavaScript is 0-indexed (January is 0, February is 1, etc),
// but by using 0 as the day it will give us the last day of the prior
// month. So passing in 1 as the month number will return the last day
// of January, not February
function days_in_month (month, year) {
  return new Date(year, month, 0).getDate();
}

// Completely rewrite the get_week_id_from_date function to fix recurring event placement
function get_week_id_from_date(date) {
  // Format a consistent date string to ensure we get a stable ID
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  
  // Get the day of month (1-31)
  const dayOfMonth = date.getDate();
  
  // Get total days in the month
  const totalDaysInMonth = days_in_month(month, year);
  
  // We divide the month into 4 equal parts
  const daysPerSegment = totalDaysInMonth / 4;
  
  // Calculate which segment (1-4) this day falls into
  // We use Math.ceil to ensure days at segment boundaries are handled correctly
  let weekInMonth = Math.ceil(dayOfMonth / daysPerSegment);
  
  // Safety check - ensure we don't exceed 4
  weekInMonth = Math.min(weekInMonth, 4);
  
  // Return the consistent ID format that matches our grid
  return `${year}-${month}-${weekInMonth}`;
}

function write_life_event(life_event) {
  const id = get_week_id_from_date(life_event['date']);
  const week_div = document.getElementById(id);
  
  if (week_div == null || week_div.classList.contains('invisible')) {
    const y = life_event['date'].getFullYear();
    const m = life_event['date'].getMonth() + 1;
    const d = life_event['date'].getDate();
    
    console.error(`Event '${life_event['description']}' has an invalid date (${y}-${m}-${d}) - Could not find cell with ID: ${id}`);
    return;
  }
  
  // Create a unique identifier for this event that includes date information
  const eventId = `${life_event['description']}_${life_event['date'].getTime()}`;
  
  // Check if this cell already has an events tracking data attribute
  if (!week_div.dataset.eventIds) {
    week_div.dataset.eventIds = JSON.stringify([]);
  }
  
  // Parse existing events
  let eventIds = JSON.parse(week_div.dataset.eventIds);
  
  // Check if this specific event is already added to this cell
  if (eventIds.includes(eventId)) {
    return; // Skip adding duplicate event
  }
  
  // Add this event to the tracking list
  eventIds.push(eventId);
  week_div.dataset.eventIds = JSON.stringify(eventIds);
  
  // Set tooltip with frequency if available
  let tooltipText = life_event['description'];
  if (life_event['frequency']) {
    const frequencyMap = {
      'once': 'Une seule fois',
      'weekly': 'Hebdomadaire',
      'monthly': 'Mensuel',
      'yearly': 'Annuel'
    };
    tooltipText += ` (${frequencyMap[life_event['frequency']] || 'Une seule fois'})`;
  }
  
  // Apply visual styles
  week_div.style.color = life_event['color'];
  week_div.style.borderColor = life_event['color'];
  week_div.style.backgroundColor = life_event['color'];
  
  if (week_div.style.backgroundColor) {
    week_div.classList.add('has-tooltip');
    week_div.dataset.tooltip = tooltipText;
  }
  
  if ('icon' in life_event) {
    week_div.classList.add('has-tooltip');
    week_div.dataset.tooltip = tooltipText;
    week_div.insertAdjacentHTML('beforeend', life_event['icon']);
  }
}

// Updated function to generate recurring events based on frequency with improved accuracy
function generateRecurringEvents(baseEvent) {
  const birthDate = new Date(myBirthDay);
  const lifeEndDate = new Date(birthDate);
  lifeEndDate.setFullYear(birthDate.getFullYear() + myLifeExpectancy);
  
  const eventDate = new Date(baseEvent.date);
  const eventsToRender = []; // Renamed to avoid conflict with global 'events'
  
  // Add the base event first
  eventsToRender.push({
    date: new Date(eventDate),
    name: baseEvent.name,
    description: baseEvent.name, // Or baseEvent.description if available
    color: 'var(--color-special-event)', // Default color for user events
    frequency: baseEvent.frequency
  });
  
  // Only add recurring instances if frequency is not 'once'
  if (baseEvent.frequency !== 'once') {
    // Keep track of weeks we've already added to avoid duplicates
    const addedWeekIds = new Set();
    
    // Add the ID of the first event
    addedWeekIds.add(get_week_id_from_date(eventDate));
    
    // Create a new date object for recurring calculations
    let nextDate = new Date(eventDate);
    
    // For each frequency type, generate proper recurring dates
    if (baseEvent.frequency === 'weekly') {
      // Start with +7 days from the original date
      nextDate = new Date(nextDate.getTime() + (7 * 24 * 60 * 60 * 1000)); 
      
      while (nextDate <= lifeEndDate) {
        // Check if we already have an event in this week
        const weekId = get_week_id_from_date(nextDate);
        
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
        
        // Move to next week
        nextDate = new Date(nextDate.getTime() + (7 * 24 * 60 * 60 * 1000));
      }
    } 
    else if (baseEvent.frequency === 'monthly') {
      // Get the day of month to maintain
      const dayOfMonth = eventDate.getDate();
      
      // Move to next month
      nextDate = new Date(eventDate);
      nextDate.setMonth(nextDate.getMonth() + 1);
      
      while (nextDate <= lifeEndDate) {
        // Check if we already have an event in this week
        const weekId = get_week_id_from_date(nextDate);
        
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
        
        // Move to next month
        nextDate.setMonth(nextDate.getMonth() + 1);
        
        // Handle month length differences
        const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
        nextDate.setDate(Math.min(dayOfMonth, lastDayOfMonth));
      }
    } 
    else if (baseEvent.frequency === 'yearly') {
      // Keep the same month and day, increment the year
      nextDate = new Date(eventDate);
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      
      while (nextDate <= lifeEndDate) {
        // Check if we already have an event in this week
        const weekId = get_week_id_from_date(nextDate);
        
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
        
        // Move to next year
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
    }
  }
  
  return eventsToRender;
}

// Function to apply custom period to a week - Refactored
function applyLifePeriods(weekElement, birthDateObj) {
  const parts = weekElement.id.split('-'); // ID is like "YYYY-M-S"
  const cellYear = parseInt(parts[0]);
  const cellMonth_1_indexed = parseInt(parts[1]);
  
  // Approximate date for the start of this cell's month
  const cellMonthStartDate = new Date(cellYear, cellMonth_1_indexed - 1, 1);

  // Calculate age in years at the start of the cell's month for period checks
  let ageAtCellMonthStart = cellYear - birthDateObj.getFullYear();
  if ( (cellMonth_1_indexed - 1) < birthDateObj.getMonth() ||
       ((cellMonth_1_indexed - 1) === birthDateObj.getMonth() && 1 < birthDateObj.getDate()) ) {
    ageAtCellMonthStart--; // Birthday for this year hasn't occurred yet by the start of this cell's month
  }

  // Academic period
  if (customSettings.academic.enabled) {
    if (ageAtCellMonthStart >= customSettings.academic.start && ageAtCellMonthStart < customSettings.academic.end) {
      weekElement.classList.add('academic');
    }
  }
  
  // Work period
  if (customSettings.work.enabled) {
    if (ageAtCellMonthStart >= customSettings.work.start && ageAtCellMonthStart < customSettings.work.end) {
      weekElement.classList.add('work');
    }
  }
  
  const today = new Date();
  // Parents period
  if (customSettings.parents.enabled) {
    const parentsDeathDate = new Date(today);
    // Ensure currentAge is not greater than expectancy to avoid negative years
    const remainingYears = Math.max(0, customSettings.parents.expectancy - customSettings.parents.currentAge);
    parentsDeathDate.setFullYear(today.getFullYear() + remainingYears);
    // Color cells from today up to parentsDeathDate (approximately, by month)
    if (cellMonthStartDate >= today && cellMonthStartDate < parentsDeathDate) {
      weekElement.classList.add('parents');
    }
  }
  
  // Siblings period
  if (customSettings.siblings.enabled) {
    const siblingsDeathDate = new Date(today);
    const remainingYears = Math.max(0, customSettings.siblings.expectancy - customSettings.siblings.currentAge);
    siblingsDeathDate.setFullYear(today.getFullYear() + remainingYears);
    if (cellMonthStartDate >= today && cellMonthStartDate < siblingsDeathDate) {
      weekElement.classList.add('siblings');
    }
  }
  
  // Grandparents period
  if (customSettings.grandparents.enabled) {
    const grandparentsDeathDate = new Date(today);
    const remainingYears = Math.max(0, customSettings.grandparents.expectancy - customSettings.grandparents.currentAge);
    grandparentsDeathDate.setFullYear(today.getFullYear() + remainingYears);
    if (cellMonthStartDate >= today && cellMonthStartDate < grandparentsDeathDate) {
      weekElement.classList.add('grandparents');
    }
  }

  // Check if it's a birthday week - Corrected logic
  if (customSettings.birthdays.enabled) { // Changed from highlightBirthdays
    const birthMonth_0_indexed = birthDateObj.getMonth(); 
    const birthDayOfMonth = birthDateObj.getDate();
    
    // Construct the date of the birthday for the cell's year
    const birthdayInCellYear = new Date(cellYear, birthMonth_0_indexed, birthDayOfMonth);

    // Check if this date is valid (e.g. Feb 29 on a non-leap year would become Mar 1)
    // and actually falls in the month we expect.
    if (birthdayInCellYear.getFullYear() === cellYear && 
        birthdayInCellYear.getMonth() === birthMonth_0_indexed && 
        birthdayInCellYear.getDate() === birthDayOfMonth) {
        
        const birthdayWeekIdForCellYear = get_week_id_from_date(birthdayInCellYear); // Format "YYYY-M-S"
        
        if (weekElement.id === birthdayWeekIdForCellYear) {
            weekElement.classList.add('birthday');
            weekElement.classList.add('has-tooltip'); // Add tooltip class
            weekElement.dataset.tooltip = 'Birthday'; // Set tooltip text
        }
    }
  }
  
  // Special events are now handled by renderAllCalendarEvents and write_life_event,
  // so the loop for specialEvents is removed from here.
}

events = [
  // // {
  // //   'date': new Date('1995-08-14'),
  // //   'description': 'Tammirinteen ala-aste 1. luokka',
  // //   'color': '#18aedb',
  // // },
  // // {
  // //   'date': new Date('1997-08-11'),
  // //   'description': 'Koulun vaihto kristilliseen kouluun',
  // //   'color': '#18aedb',
  // // },
  // // {
  // //   'date': new Date('1999-05-07'),
  // //   'description': 'Ensimmäiset kotisivut nettiin',
  // //   'color': '#e806f8',
  // // },
  // {
  //   'date': new Date('2004-07-30'),
  //   'description': '1. ulkomaanmatka',
  //   'color': '#e806f8',
  // },
  {
    'date': new Date('2007-07-02'),
    'description': 'Lakkiaiset',
    'color': '#18aedb',
  },
  {
    'date': new Date('2007-06-01'),
    'description': 'Ensitapaaminen IRCissä Veeran kanssa',
    'color': '#f8312f',
    'icon': '❤️',
  },
  {
    'date': new Date('2007-06-11'),
    'description': 'Siviilipalvelus alkaa',
    'color': '#18aedb',
  },
  {
    'date': new Date('2007-12-25'),
    'description': 'Muutto omilleen',
    'color': '#f8f806',
  },
  {
    'date': new Date('2008-06-01'),
    'description': 'Muutto Kauppakadulle',
    'color': '#f8f806',
  },
  {
    'date': new Date('2009-03-30'),
    'description': 'Lotan syntymä',
    'color': '#3ef806',
  },
  {
    'date': new Date('2009-09-07'),
    'description': 'Harjoitteluun Data Groupille',
    'color': '#18aedb',
  },
  {
    'date': new Date('2010-03-16'),
    'description': 'Vanhempien ero',
    'color': '#222222',
  },
  {
    'date': new Date('2010-03-30'),
    'description': 'Muutto Kangaslammelle',
    'color': '#f8f806',
  },
  {
    'date': new Date('2010-12-07'),
    'description': 'Ensimmäinen työpaikka',
    'color': '#18aedb',
  },
  {
    'date': new Date('2013-05-02'),
    'description': 'Muutto Rasinrinteelle',
    'color': '#f8f806',
  },
  {
    'date': new Date('2013-05-02'),
    'description': 'Muutto Rasinrinteelle',
    'color': '#f8f806',
  },
  {
    'date': new Date('2013-08-26'),
    'description': 'Manun syntymä',
    'color': '#3ef806',
  },
  {
    'date': new Date('2013-05-22'),
    'description': 'Oman yrityksen perustaminen',
    'color': '#18aedb',
  },
  {
    'date': new Date('2015-08-01'),
    'description': 'Muutto Vapaudenkadulle',
    'color': '#f8f806',
  },
  {
    'date': new Date('2008-03-28'),
    'description': 'Kihloihin Veeran kanssa',
    'color': '#f8312f',
    'icon': '❤️',
  },
  {
    'date': new Date('2008-07-02'),
    'description': 'Naimisiin Veeran kanssa',
    'color': '#f8312f',
    'icon': '❤️',
  },
  {
    'date': new Date('2018-02-07'),
    'description': '10-vuotishääpäivä',
    'color': '#f8312f',
    'icon': '❤️',
  },
  {
    'date': new Date('2019-01-15'),
    'description': 'Isän kuolema',
    'color': '#222222',
    'icon': '💀',
  },
  {
    'date': new Date('2020-08-09'),
    'description': 'Alkoholinkäytön lopettaminen',
    'color': '#f88b06',
  },
  {
    'date': new Date('2020-09-10'),
    'description': 'Veloista 100% eroon pääseminen',
    'color': '#f88b06',
  },
  {
    'date': new Date('2022-07-21'),
    'description': '-20kg, paino 73kg',
    'color': '#f88b06',
  },
  {
    'date': new Date('2022-08-01'),
    'description': 'Muutto Vaihdekujalle',
    'color': '#f8f806',
  },
  {
    'date': new Date('2023-05-22'),
    'description': '10 vuotta yrittäjänä',
    'color': '#18aedb',
  },
];

// Function to render all predefined and special events on the calendar
function renderAllCalendarEvents() {
    // Apply predefined events
    if (showPredefinedEvents) {
        events.forEach(e => { // 'events' is the hardcoded global list
            write_life_event(e);
        });
    }

    // Apply user-defined special events
    specialEvents.forEach(userEvent => { // userEvent is {name, date, frequency}
        const allInstances = generateRecurringEvents(userEvent);
        allInstances.forEach(instance => {
            // instance has {date, name, description, color, frequency}
            // write_life_event expects description, color.
            write_life_event({
                date: instance.date,
                description: instance.description, // or instance.name
                color: instance.color, // Color set by generateRecurringEvents
                // icon: instance.icon, // generateRecurringEvents doesn't currently handle icons for user events
                frequency: instance.frequency // for tooltip
            });
        });
    });
}

// Function to update the legend based on active periods
function updateLegend() {
  const legendContainer = document.getElementById('legend-container');
  const legendItems = document.querySelector('.legend-items');
  
  // Clear existing legend items
  legendItems.innerHTML = '';
  
  // Create legend items based on active periods
  const legendData = [];
  
  // Birthday legend item (always show)
  if (customSettings.birthdays.enabled) { // Changed from highlightBirthdays
    legendData.push({
      color: 'var(--color-birthday)',
      label: 'Semaines d\'anniversaire'
    });
  }
  
  // Special events legend item (always show if there are any or if predefined are shown)
  if (specialEvents.length > 0 || showPredefinedEvents) {
    legendData.push({
      color: 'var(--color-special-event)',
      label: 'Événements spéciaux'
    });
  }
  
  // Life periods legend
  if (customSettings.academic.enabled) {
    legendData.push({
      color: 'var(--color-academic)',
      label: 'Période académique'
    });
  }
  
  if (customSettings.work.enabled) {
    legendData.push({
      color: 'var(--color-work)',
      label: 'Période de travail'
    });
  }
  
  if (customSettings.parents.enabled) {
    legendData.push({
      color: 'var(--color-parents)',
      label: 'Temps avec parents'
    });
  }
  
  if (customSettings.siblings.enabled) {
    legendData.push({
      color: 'var(--color-siblings)',
      label: 'Temps avec fratrie'
    });
  }
  
  if (customSettings.grandparents.enabled) {
    legendData.push({
      color: 'var(--color-grandparents)',
      label: 'Temps avec grands-parents'
    });
  }
  
  // If no active periods, hide the legend
  if (legendData.length === 0) {
    legendContainer.style.display = 'none';
    return;
  }
  
  // Show the legend container
  legendContainer.style.display = 'block';
  
  // Add legend items
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

// Initialize options panel
document.addEventListener('DOMContentLoaded', function() {
  // Toggle options panel
  const toggleBtn = document.getElementById('toggle-options');
  const optionsContainer = document.querySelector('.options-container');
  
  toggleBtn.addEventListener('click', function() {
    optionsContainer.classList.toggle('hidden');
    toggleBtn.textContent = optionsContainer.classList.contains('hidden') ? 'Afficher les options' : 'Masquer les options';
  });
  
  // Force dark theme
  document.documentElement.setAttribute('data-theme', 'dark');
  
  // Set default birthdate to the one defined at the top
  if (document.getElementById('custom-birthdate')) {
    document.getElementById('custom-birthdate').value = myBirthDay;
  }
  
  // Set default life expectancy
  if (document.getElementById('life-expectancy')) {
    document.getElementById('life-expectancy').value = myLifeExpectancy;
  }
  
  // Set up modifier toggles
  document.querySelectorAll('.modifier-toggle').forEach(toggle => {
    toggle.addEventListener('change', function() {
      const modifierName = this.id.replace('-toggle', '');
      const valueInput = document.getElementById(`${modifierName}-modifier`);
      const modifierValueDiv = valueInput.closest('.modifier-value'); // Get the parent .modifier-value
      
      lifeModifiers[modifierName].enabled = this.checked;
      valueInput.disabled = !this.checked;
      if (modifierValueDiv) { // Check if modifierValueDiv exists
        modifierValueDiv.style.display = this.checked ? 'block' : 'none';
      }
    });
  });
  
  // Set up period toggles
  document.querySelectorAll('.period-toggle').forEach(toggle => {
    toggle.addEventListener('change', function() {
      const periodName = this.id.replace('-toggle', '');
      const periodValues = this.parentElement.parentElement.querySelector('.period-value');
      
      if (customSettings[periodName]) { // Ensure the setting exists
        customSettings[periodName].enabled = this.checked;
      }
      
      if (periodValues) { // Check if periodValues exists before accessing style
        periodValues.style.display = this.checked ? 'block' : 'none';
      }
    });
  });
  
  // Set up predefined events toggle
  const showPredefinedEventsToggle = document.getElementById('show-predefined-events');
  if (showPredefinedEventsToggle) {
    showPredefinedEventsToggle.checked = showPredefinedEvents; // Set initial state
    showPredefinedEventsToggle.addEventListener('change', function() {
      showPredefinedEvents = this.checked;
    });
  }
  
  // Event handlers for the special events
  document.getElementById('add-event-btn').addEventListener('click', function() {
    const eventName = document.getElementById('event-name').value;
    const eventDate = document.getElementById('event-date').value;
    const eventFrequency = document.getElementById('event-frequency').value;
    
    if (eventName && eventDate) {
      const newEvent = {
        name: eventName,
        date: eventDate,
        frequency: eventFrequency
      };
      
      specialEvents.push(newEvent);
      updateEventsList();
      
      // Reset fields
      document.getElementById('event-name').value = '';
      document.getElementById('event-date').value = '';
      document.getElementById('event-frequency').value = 'once';
    } else {
      alert('Veuillez remplir tous les champs');
    }
  });
  
  // Apply settings button
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
    
    // Recalculate weeks left
    weeksLeft = returnWeeks(myBirthDay);
    progress = Math.ceil(totalWeeksInLife) - Math.ceil(weeksLeft) + ' weeks lived. ' + weeksLeft + ' weeks left of all total ' + Math.ceil(totalWeeksInLife) + ' weeks available.';
    
    // Update stats display
    document.querySelector('.weeksleft-label').innerHTML = progress;
    
    // Regenerate calendar
    let calendar = document.getElementById('calendar');
    populate_calendar(new Date(myBirthDay), myLifeExpectancy);
    
    // `populate_calendar` creates fresh cells, so `dataset.eventIds` are clear.
    // No need to manually clear `dataset.eventIds` here if populate_calendar rebuilds fully.

    // Apply all events (predefined and special)
    renderAllCalendarEvents();
    
    // Apply life periods (academic, work, birthdays, etc.)
    const birthDateForPeriods = new Date(myBirthDay);
    document.querySelectorAll('.week-cell').forEach(weekCell => { // Removed 'index' as it's not used by new applyLifePeriods
      if (!weekCell.classList.contains('invisible')) {
        applyLifePeriods(weekCell, birthDateForPeriods);
      }
    });
    
    // Update legend after settings are applied
    updateLegend();
  });
  
  // Initialize display states based on toggles
  document.querySelectorAll('.modifier-toggle').forEach(toggle => {
    const modifierName = toggle.id.replace('-toggle', '');
    const valueInput = document.getElementById(`${modifierName}-modifier`);
    const modifierValueDiv = valueInput.closest('.modifier-value'); // Get the parent .modifier-value

    // Set initial checked state from lifeModifiers
    if (lifeModifiers[modifierName]) {
        toggle.checked = lifeModifiers[modifierName].enabled;
    }
    valueInput.disabled = !toggle.checked;
    if (modifierValueDiv) { // Check if modifierValueDiv exists
      modifierValueDiv.style.display = toggle.checked ? 'block' : 'none';
    }
  });
  
  document.querySelectorAll('.period-toggle').forEach(toggle => {
    const periodName = toggle.id.replace('-toggle', '');
    const periodValues = toggle.parentElement.parentElement.querySelector('.period-value');
    // Set initial checked state from customSettings
    if (customSettings[periodName]) {
        toggle.checked = customSettings[periodName].enabled;
    }
    if (periodValues) { // Check if periodValues exists
      periodValues.style.display = toggle.checked ? 'block' : 'none';
    }
  });
  
  // Initialize the legend
  updateLegend();
});

// Update events list display
function updateEventsList() {
  const eventsList = document.getElementById('events-list');
  eventsList.innerHTML = '';
  
  const frequencyMap = {
    'once': 'Une seule fois',
    'weekly': 'Hebdomadaire',
    'monthly': 'Mensuel',
    'yearly': 'Annuel'
  };
  
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

let calendar = document.getElementById('calendar');
populate_calendar(new Date(myBirthDay), myLifeExpectancy);

// `populate_calendar` creates fresh cells.

// Apply all events (predefined and special) for initial load
renderAllCalendarEvents();

// Apply life periods after calendar is populated for initial load
const initialBirthDate = new Date(myBirthDay);
document.querySelectorAll('.week-cell').forEach(weekCell => { // Removed 'index'
  if (!weekCell.classList.contains('invisible')) {
    applyLifePeriods(weekCell, initialBirthDate);
  }
});

// Initial legend update
updateLegend();
