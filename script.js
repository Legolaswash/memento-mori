// Set up vars
let myBirthDay = '2004-09-04';
let myLifeExpectancy = 80;
let totalWeeksInLife = myLifeExpectancy * 52.1429; // As per the modern Gregorian calendar, one year is equal to 365 days which is 52.1429 weeks in total

// Life modifiers settings
let lifeModifiers = {
  exercise: {
    enabled: true,
    value: 2
  },
  smoking: {
    enabled: true,
    value: -5
  },
  diet: {
    enabled: true,
    value: 3
  }
};

// Custom life period settings
let customSettings = {
  academic: {
    start: 6, // age in years
    end: 23,  // age in years
    enabled: true
  },
  work: {
    start: 23, // age in years
    end: 65,   // age in years
    enabled: true
  },
  parents: {
    currentAge: 60,
    expectancy: 85,
    enabled: true
  },
  siblings: {
    currentAge: 30,
    expectancy: 82,
    enabled: true
  },
  grandparents: {
    currentAge: 80,
    expectancy: 90,
    enabled: true
  }
};

// Display mode settings
let displayMode = 'all';

// Birthday highlight setting
let highlightBirthdays = true;

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

// Completely rework the get_week_id_from_date function to be more reliable
function get_week_id_from_date(date) {
  // Format a consistent date string to ensure we get a stable ID
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  // Calculate which week in the month (1-4) this date falls into
  const dayOfMonth = date.getDate();
  const totalDaysInMonth = days_in_month(month, year);
  
  // Split the month into 4 equal parts and determine which part the date falls into
  const weekInMonth = Math.min(Math.ceil((dayOfMonth / totalDaysInMonth) * 4), 4);
  
  // Return a consistent ID format that matches our grid cell IDs
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
  
  // Create a unique identifier for this event
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
    tooltipText += ` (${frequencyMap[life_event['frequency']]})`;
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

// Updated function to generate and apply recurring events based on frequency
function generateRecurringEvents(baseEvent) {
  const birthDate = new Date(myBirthDay);
  const lifeEndDate = new Date(birthDate);
  lifeEndDate.setFullYear(birthDate.getFullYear() + myLifeExpectancy);
  
  const eventDate = new Date(baseEvent.date);
  const events = [];
  
  // Add the base event only once
  events.push({
    date: new Date(eventDate),
    name: baseEvent.name,
    description: baseEvent.name,
    color: 'var(--color-special-event)',
    frequency: baseEvent.frequency
  });
  
  // Only add recurring instances if frequency is not 'once'
  if (baseEvent.frequency !== 'once') {
    let nextDate = new Date(eventDate);
    
    if (baseEvent.frequency === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
      
      while (nextDate <= lifeEndDate) {
        events.push({
          date: new Date(nextDate),
          name: baseEvent.name,
          description: baseEvent.name,
          color: 'var(--color-special-event)',
          frequency: baseEvent.frequency
        });
        nextDate.setDate(nextDate.getDate() + 7);
      }
    } 
    else if (baseEvent.frequency === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
      
      while (nextDate <= lifeEndDate) {
        events.push({
          date: new Date(nextDate),
          name: baseEvent.name,
          description: baseEvent.name,
          color: 'var(--color-special-event)',
          frequency: baseEvent.frequency
        });
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
    } 
    else if (baseEvent.frequency === 'yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      
      while (nextDate <= lifeEndDate) {
        events.push({
          date: new Date(nextDate),
          name: baseEvent.name,
          description: baseEvent.name,
          color: 'var(--color-special-event)',
          frequency: baseEvent.frequency
        });
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
    }
  }
  
  return events;
}

// Function to apply custom period to a week
function applyLifePeriods(weekElement, birthDate, weekIndex) {
  // Calculate current age in weeks
  const today = new Date();
  const birth = new Date(birthDate);
  const ageInWeeks = Math.floor((today - birth) / (1000 * 60 * 60 * 24 * 7));
  
  // Based on display mode, show only specific period or all
  let classList = [];
  
  // Academic period
  if (customSettings.academic.enabled && 
      (displayMode === 'all' || displayMode === 'academic')) {
    const academicStartWeek = customSettings.academic.start * 52;
    const academicEndWeek = customSettings.academic.end * 52;
    if (weekIndex >= academicStartWeek && weekIndex <= academicEndWeek) {
      classList.push('academic');
    }
  }
  
  // Work period
  if (customSettings.work.enabled && 
      (displayMode === 'all' || displayMode === 'work')) {
    const workStartWeek = customSettings.work.start * 52;
    const workEndWeek = customSettings.work.end * 52;
    if (weekIndex >= workStartWeek && weekIndex <= workEndWeek) {
      classList.push('work');
    }
  }
  
  // Parents period
  if (customSettings.parents.enabled && 
      (displayMode === 'all' || displayMode === 'parents')) {
    const parentsRemainingYears = customSettings.parents.expectancy - customSettings.parents.currentAge;
    const parentsEndWeek = ageInWeeks + (parentsRemainingYears * 52);
    if (weekIndex <= parentsEndWeek) {
      classList.push('parents');
    }
  }
  
  // Siblings period
  if (customSettings.siblings.enabled && 
      (displayMode === 'all' || displayMode === 'siblings')) {
    const siblingsRemainingYears = customSettings.siblings.expectancy - customSettings.siblings.currentAge;
    const siblingsEndWeek = ageInWeeks + (siblingsRemainingYears * 52);
    if (weekIndex <= siblingsEndWeek) {
      classList.push('siblings');
    }
  }
  
  // Grandparents period
  if (customSettings.grandparents.enabled && 
      (displayMode === 'all' || displayMode === 'grandparents')) {
    const grandparentsRemainingYears = customSettings.grandparents.expectancy - customSettings.grandparents.currentAge;
    const grandparentsEndWeek = ageInWeeks + (grandparentsRemainingYears * 52);
    if (weekIndex <= grandparentsEndWeek) {
      classList.push('grandparents');
    }
  }

  // Check if it's a birthday week
  if (highlightBirthdays) {
    // Calculate birth week in the year (0-51)
    const birthWeekOfYear = Math.floor((birth.getDay() + birth.getDate() - 1) / 7);
    
    // Calculate current week in the year
    const weekDate = new Date(birth.getTime() + (weekIndex * 7 * 24 * 60 * 60 * 1000));
    const startOfYear = new Date(weekDate.getFullYear(), 0, 1);
    const weekOfYear = Math.floor((weekDate - startOfYear) / (7 * 24 * 60 * 60 * 1000));
    
    // Check if current week matches birth week of the year
    if (weekOfYear === birthWeekOfYear) {
      classList.push('birthday');
    }
  }
  
  // Apply classes based on display mode
  if (displayMode === 'all') {
    // Apply all classes
    classList.forEach(cls => weekElement.classList.add(cls));
  } else {
    // Apply only the selected class with outline style
    const selectedClass = classList.find(cls => cls === displayMode);
    if (selectedClass) {
      weekElement.classList.add(selectedClass, 'outline');
    }
  }
  
  // Special events
  specialEvents.forEach(event => {
    const eventDate = new Date(event.date);
    const eventWeeks = Math.floor((eventDate - birth) / (1000 * 60 * 60 * 24 * 7));
    
    if (weekIndex === eventWeeks) {
      weekElement.classList.add('event');
      weekElement.dataset.tooltip = event.name;
    }
  });
}

events = [
  {
    'date': new Date('1995-08-14'),
    'description': 'Tammirinteen ala-aste 1. luokka',
    'color': '#18aedb',
  },
  {
    'date': new Date('1997-08-11'),
    'description': 'Koulun vaihto kristilliseen kouluun',
    'color': '#18aedb',
  },
  {
    'date': new Date('1999-05-07'),
    'description': 'Ensimmäiset kotisivut nettiin',
    'color': '#e806f8',
  },
  {
    'date': new Date('2004-07-30'),
    'description': '1. ulkomaanmatka',
    'color': '#e806f8',
  },
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

// Initialize options panel
document.addEventListener('DOMContentLoaded', function() {
  // Toggle options panel
  const toggleBtn = document.getElementById('toggle-options');
  const optionsContainer = document.querySelector('.options-container');
  
  toggleBtn.addEventListener('click', function() {
    optionsContainer.classList.toggle('hidden');
    toggleBtn.textContent = optionsContainer.classList.contains('hidden') ? 'Afficher les options' : 'Masquer les options';
  });
  
  // Toggle dark/light mode
  const toggleThemeBtn = document.getElementById('toggle-theme');
  if (toggleThemeBtn) {
    // Check if user has a saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
      toggleThemeBtn.textContent = savedTheme === 'dark' ? '☀️ Mode clair' : '🌙 Mode sombre';
    }
    
    toggleThemeBtn.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      toggleThemeBtn.textContent = newTheme === 'dark' ? '☀️ Mode clair' : '🌙 Mode sombre';
    });
  }
  
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
      
      lifeModifiers[modifierName].enabled = this.checked;
      valueInput.disabled = !this.checked;
    });
  });
  
  // Set up period toggles
  document.querySelectorAll('.period-toggle').forEach(toggle => {
    toggle.addEventListener('change', function() {
      const periodName = this.id.replace('-toggle', '');
      const periodValues = this.parentElement.parentElement.querySelector('.period-value');
      
      customSettings[periodName].enabled = this.checked;
      periodValues.style.display = this.checked ? 'block' : 'none';
    });
  });
  
  // Set up display mode radio buttons
  document.querySelectorAll('input[name="display-mode"]').forEach(radio => {
    radio.addEventListener('change', function() {
      displayMode = this.value;
    });
  });
  
  // Set up birthday highlight toggle
  document.getElementById('highlight-birthdays').addEventListener('change', function() {
    highlightBirthdays = this.checked;
  });
  
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
    
    // Recalculate weeks left
    weeksLeft = returnWeeks(myBirthDay);
    progress = Math.ceil(totalWeeksInLife) - Math.ceil(weeksLeft) + ' weeks lived. ' + weeksLeft + ' weeks left of all total ' + Math.ceil(totalWeeksInLife) + ' weeks available.';
    
    // Update stats display
    document.querySelector('.weeksleft-label').innerHTML = progress;
    
    // Regenerate calendar
    let calendar = document.getElementById('calendar');
    populate_calendar(new Date(myBirthDay), myLifeExpectancy);
    
    // Clear existing event tracking before applying events
    document.querySelectorAll('.week-cell').forEach(cell => {
      // Delete any existing event tracking
      delete cell.dataset.eventIds;
    });
    
    // Apply original events
    events.forEach(e => {
      write_life_event(e);
    });
    
    // Apply life periods
    const birthDate = new Date(myBirthDay);
    document.querySelectorAll('.week-cell').forEach((weekCell, index) => {
      if (!weekCell.classList.contains('invisible')) {
        applyLifePeriods(weekCell, birthDate, index);
      }
    });
    
    // Apply user's custom events with frequency handling - Fixed
    specialEvents.forEach(event => {
      // For debugging
      // console.log(`Processing event: ${event.name} on ${event.date} (${event.frequency})`);
      // Make sure the event date is a proper Date object for processing
      const eventObj = {
        ...event,
        date: new Date(event.date)
      };
      
      const recurringEvents = generateRecurringEvents(eventObj);
      
      recurringEvents.forEach(recurringEvent => {
        write_life_event({
          'date': new Date(recurringEvent.date),
          'description': recurringEvent.name,
          'color': 'var(--color-special-event)',
          'frequency': recurringEvent.frequency
        });
      });
    });
  });
  
  // Initialize display states based on toggles
  document.querySelectorAll('.modifier-toggle').forEach(toggle => {
    const modifierName = toggle.id.replace('-toggle', '');
    const valueInput = document.getElementById(`${modifierName}-modifier`);
    valueInput.disabled = !toggle.checked;
  });
  
  document.querySelectorAll('.period-toggle').forEach(toggle => {
    const periodValues = toggle.parentElement.parentElement.querySelector('.period-value');
    periodValues.style.display = toggle.checked ? 'block' : 'none';
  });
  
  // Initialize theme based on system preference if no saved preference
  if (!localStorage.getItem('theme')) {
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDarkScheme.matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (toggleThemeBtn) {
        toggleThemeBtn.textContent = '☀️ Mode clair';
      }
    }
  }
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

// Clear any existing event tracking
document.querySelectorAll('.week-cell').forEach(cell => {
  delete cell.dataset.eventIds;
});

// Apply events
events.forEach(e => {
  write_life_event(e);
});

// Apply life periods after calendar is populated
const birthDate = new Date(myBirthDay);
document.querySelectorAll('.week-cell').forEach((weekCell, index) => {
  if (!weekCell.classList.contains('invisible')) {
    applyLifePeriods(weekCell, birthDate, index);
  }
});
