(function () {
  var API_BASE = 'https://hyprbuild.app/api';
  var LOGIN_URL = 'https://hyprbuild.app/login.html?next=' + encodeURIComponent(window.location.href);
  var CLERK_PUBLISHABLE_KEY = 'pk_live_Y2xlcmsuaHlwcmJ1aWxkLmFwcCQ';

  var sidebar = document.getElementById('sidebar');
  var menuToggle = document.getElementById('menu-toggle');
  var overlay = document.getElementById('overlay');
  var routeLinks = Array.from(document.querySelectorAll('.nav-item[data-route]'));
  var filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  var tableBody = document.getElementById('project-table-body');
  var activityList = document.getElementById('activity-list');
  var profileName = document.getElementById('profile-name');
  var profileButton = document.getElementById('profile-button');
  var pageTitle = document.getElementById('page-title');
  var pageKicker = document.getElementById('page-kicker');
  var statusBanner = document.getElementById('api-status');
  var clearActivityButton = document.getElementById('clear-activity-button');
  var viewOverview = document.getElementById('view-overview');
  var viewSettings = document.getElementById('view-settings');
  var viewNewProject = document.getElementById('view-new-project');
  var settingsNameForm = document.getElementById('settings-name-form');
  var settingsPhotoForm = document.getElementById('settings-photo-form');
  var settingsEmailForm = document.getElementById('settings-email-form');
  var settingsPasswordForm = document.getElementById('settings-password-form');
  var settingsSignoutButton = document.getElementById('settings-signout-button');
  var settingsFirstNameInput = document.getElementById('settings-first-name');
  var settingsLastNameInput = document.getElementById('settings-last-name');
  var settingsPrimaryEmailInput = document.getElementById('settings-primary-email');
  var settingsBackupEmailInput = document.getElementById('settings-backup-email');
  var settingsPhotoFileInput = document.getElementById('settings-photo-file');
  var settingsPhotoFileName = document.getElementById('settings-photo-file-name');
  var settingsCurrentPasswordInput = document.getElementById('settings-current-password');
  var settingsNewPasswordInput = document.getElementById('settings-new-password');
  var settingsConfirmPasswordInput = document.getElementById('settings-confirm-password');
  var settingsAvatarPreview = document.getElementById('settings-avatar-preview');
  var settingsFeedback = document.getElementById('settings-feedback');
  var projectFlowSteps = Array.from(document.querySelectorAll('#project-flow-steps [data-step]'));
  var projectStepPanes = Array.from(document.querySelectorAll('.project-step-pane'));
  var planCards = Array.from(document.querySelectorAll('.plan-card[data-plan-key]'));
  var projectFlowError = document.getElementById('project-flow-error');
  var projectNameInput = document.getElementById('project-name-input');
  var domainRootInput = document.getElementById('domain-root-input');
  var domainCheckButton = document.getElementById('domain-check-button');
  var domainResults = document.getElementById('domain-results');
  var selectedDomainLine = document.getElementById('selected-domain-line');
  var useSubdomainCheckbox = document.getElementById('use-subdomain-checkbox');
  var subdomainFields = document.getElementById('subdomain-fields');
  var subdomainList = document.getElementById('subdomain-list');
  var addSubdomainButton = document.getElementById('add-subdomain-button');
  var websitePromptInput = document.getElementById('website-prompt-input');
  var projectBackButton = document.getElementById('project-back-button');
  var projectNextButton = document.getElementById('project-next-button');
  var checkoutButton = document.getElementById('checkout-button');
  var checkoutPlan = document.getElementById('checkout-plan');
  var checkoutProjectName = document.getElementById('checkout-project-name');
  var checkoutDomain = document.getElementById('checkout-domain');
  var checkoutDomainCost = document.getElementById('checkout-domain-cost');
  var checkoutSubdomain = document.getElementById('checkout-subdomain');
  var checkoutSubdomainUse = document.getElementById('checkout-subdomain-use');
  var checkoutTotal = document.getElementById('checkout-total');

  var kpiProjects = document.getElementById('kpi-projects');
  var kpiSuccess = document.getElementById('kpi-success');
  var kpiDeploy = document.getElementById('kpi-deploy');
  var kpiLeads = document.getElementById('kpi-leads');

  var kpiProjectsDelta = document.getElementById('kpi-projects-delta');
  var kpiSuccessDelta = document.getElementById('kpi-success-delta');
  var kpiDeployDelta = document.getElementById('kpi-deploy-delta');
  var kpiLeadsDelta = document.getElementById('kpi-leads-delta');

  var sidebarCreateProject = document.getElementById('sidebar-create-project');
  var newProjectButton = document.getElementById('new-project-button');
  var exportButton = document.getElementById('export-button');

  var clerkInstance = null;
  var authToken = '';
  var currentUser = null;
  var currentActivityItems = [];
  var currentView = 'overview';
  var projectFlowStep = 1;
  var projectFlowState = {
    planKey: '',
    projectName: '',
    domainRoot: '',
    selectedDomain: null,
    useSubdomain: false,
    subdomains: [],
    prompt: ''
  };

  var PLAN_OPTIONS = {
    starter: { label: 'Starter Site', price: 59 },
    pro: { label: 'Pro Site', price: 99 },
    business: { label: 'Business Site', price: 179 }
  };

  var DOMAIN_PRICE_MAP = {
    '.com': 14,
    '.ai': 79,
    '.io': 49,
    '.app': 22,
    '.dev': 18
  };

  var setStatus = function (message, kind) {
    if (!statusBanner) {
      return;
    }
    statusBanner.classList.remove('error', 'success');
    if (kind === 'error') {
      statusBanner.textContent = message || 'Something went wrong.';
      statusBanner.classList.add('error');
      statusBanner.hidden = false;
      return;
    }
    statusBanner.textContent = '';
    statusBanner.hidden = true;
  };

  var formatNumber = function (value) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '--';
    }
    return value.toLocaleString();
  };

  var formatCurrency = function (value) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '$0';
    }
    return '$' + value.toFixed(value % 1 === 0 ? 0 : 2);
  };

  var cleanDomainRoot = function (value) {
    return String(value || '')
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\..*$/, '')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  var parseOptionalNumber = function (value) {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  var hasOwn = function (object, key) {
    return !!object && Object.prototype.hasOwnProperty.call(object, key);
  };

  var getUserEmail = function (user) {
    if (!user) {
      return '';
    }

    if (typeof user.primaryEmailAddress === 'string') {
      return user.primaryEmailAddress;
    }

    if (user.primaryEmailAddress && typeof user.primaryEmailAddress.emailAddress === 'string') {
      return user.primaryEmailAddress.emailAddress;
    }

    if (Array.isArray(user.emailAddresses) && user.emailAddresses.length > 0) {
      var primaryId = user.primaryEmailAddressId || '';
      var matched = user.emailAddresses.find(function (entry) {
        return entry && (entry.id === primaryId || entry.emailAddress === primaryId);
      });
      if (matched && typeof matched.emailAddress === 'string') {
        return matched.emailAddress;
      }
      var first = user.emailAddresses.find(function (entry) {
        return entry && typeof entry.emailAddress === 'string';
      });
      if (first) {
        return first.emailAddress;
      }
    }

    return user.email || '';
  };

  var getUserDisplayName = function (user) {
    if (!user) {
      return 'Account';
    }

    if (user.fullName && String(user.fullName).trim()) {
      return String(user.fullName).trim();
    }

    var combined = [user.firstName || '', user.lastName || ''].join(' ').trim();
    if (combined) {
      return combined;
    }

    return getUserEmail(user) || user.id || 'Account';
  };

  var normalizeRole = function (roleValue) {
    var role = String(roleValue || '')
      .trim()
      .toLowerCase();
    if (!role || role === 'app') {
      return 'user';
    }
    return role;
  };

  var escapeHtml = function (value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  };

  var setSettingsFeedback = function (message, isError) {
    if (!settingsFeedback) {
      return;
    }
    settingsFeedback.textContent = message || '';
    settingsFeedback.classList.remove('is-error', 'is-success');
    if (!message) {
      return;
    }
    settingsFeedback.classList.add(isError ? 'is-error' : 'is-success');
  };

  var updatePhotoFileNameLabel = function () {
    if (!settingsPhotoFileName) {
      return;
    }
    var file = settingsPhotoFileInput && settingsPhotoFileInput.files ? settingsPhotoFileInput.files[0] : null;
    settingsPhotoFileName.textContent = file && file.name ? file.name : 'No file selected';
  };

  var pushActivity = function (message) {
    if (!message) {
      return;
    }
    setActivityItems(
      [
        {
          message: message,
          time: 'Now'
        }
      ].concat(currentActivityItems).slice(0, 8)
    );
  };

  var closeSidebar = function () {
    if (!sidebar || !menuToggle || !overlay) {
      return;
    }
    sidebar.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    overlay.hidden = true;
  };

  var openSidebar = function () {
    if (!sidebar || !menuToggle || !overlay) {
      return;
    }
    sidebar.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    overlay.hidden = false;
  };

  var getRouteFromHash = function () {
    var route = String(window.location.hash || '')
      .replace(/^#/, '')
      .trim()
      .toLowerCase();
    if (route === 'settings') {
      return 'settings';
    }
    if (route === 'new-project') {
      return 'new-project';
    }
    return 'overview';
  };

  var setCurrentView = function (route, syncHash) {
    var nextView = route === 'settings' || route === 'new-project' ? route : 'overview';
    currentView = nextView;

    var showOverview = nextView === 'overview';
    var showSettings = nextView === 'settings';
    var showNewProject = nextView === 'new-project';

    if (viewOverview) {
      viewOverview.hidden = !showOverview;
      viewOverview.style.display = showOverview ? '' : 'none';
    }
    if (viewSettings) {
      viewSettings.hidden = !showSettings;
      viewSettings.style.display = showSettings ? 'grid' : 'none';
    }
    if (viewNewProject) {
      viewNewProject.hidden = !showNewProject;
      viewNewProject.style.display = showNewProject ? 'grid' : 'none';
    }

    routeLinks.forEach(function (link) {
      var linkRoute = link.getAttribute('data-route') || '';
      var isActive = linkRoute === nextView;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    if (pageTitle) {
      pageTitle.textContent = nextView === 'settings' ? 'Settings' : nextView === 'new-project' ? 'New Project' : 'Overview';
    }
    if (pageKicker) {
      pageKicker.textContent = 'Dashboard';
    }
    if (profileButton) {
      profileButton.setAttribute('aria-expanded', nextView === 'settings' ? 'true' : 'false');
    }
    if (exportButton) {
      exportButton.hidden = nextView !== 'overview';
    }
    if (newProjectButton) {
      newProjectButton.hidden = nextView === 'new-project';
    }

    if (syncHash) {
      var expectedHash = '#' + nextView;
      if (window.location.hash !== expectedHash) {
        window.history.replaceState(null, '', expectedHash);
      }
    }
  };

  var syncProfileFields = function (user) {
    if (settingsFirstNameInput) {
      settingsFirstNameInput.value = user && user.firstName ? user.firstName : '';
    }
    if (settingsLastNameInput) {
      settingsLastNameInput.value = user && user.lastName ? user.lastName : '';
    }
    if (settingsPrimaryEmailInput) {
      settingsPrimaryEmailInput.value = getUserEmail(user);
    }
    if (settingsAvatarPreview) {
      settingsAvatarPreview.src = user && user.imageUrl ? user.imageUrl : 'assets/faviconlogo.png';
    }
  };

  var setProjectFlowError = function (message) {
    if (!projectFlowError) {
      return;
    }
    projectFlowError.textContent = message || '';
  };

  var setPlanSelection = function (planKey) {
    projectFlowState.planKey = planKey in PLAN_OPTIONS ? planKey : '';
    planCards.forEach(function (card) {
      var isSelected = card.getAttribute('data-plan-key') === projectFlowState.planKey;
      card.classList.toggle('is-selected', isSelected);
      card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    });
  };

  var setDomainSelectedLine = function () {
    if (!selectedDomainLine) {
      return;
    }
    if (projectFlowState.selectedDomain) {
      selectedDomainLine.textContent =
        'Selected domain: ' +
        projectFlowState.selectedDomain.name +
        ' (' +
        formatCurrency(projectFlowState.selectedDomain.price) +
        '/yr)';
      return;
    }
    selectedDomainLine.textContent = 'No domain selected.';
  };

  var buildDomainOptions = function (root) {
    var reservedRoots = ['google', 'facebook', 'apple', 'amazon', 'openai', 'hyprbuild'];
    return Object.keys(DOMAIN_PRICE_MAP).map(function (tld) {
      var fqdn = root + tld;
      var unavailable = reservedRoots.includes(root) || fqdn.length < 4;
      return {
        root: root,
        tld: tld,
        name: fqdn,
        price: DOMAIN_PRICE_MAP[tld],
        available: !unavailable
      };
    });
  };

  var priceFromName = function (name) {
    var tldIndex = String(name || '').lastIndexOf('.');
    if (tldIndex === -1) {
      return null;
    }
    var tld = name.slice(tldIndex);
    return DOMAIN_PRICE_MAP[tld] || null;
  };

  var normalizeDomainResponse = function (payload, root) {
    if (!payload) {
      return [];
    }

    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload.domains)) {
      return payload.domains;
    }

    if (Array.isArray(payload.results)) {
      return payload.results;
    }

    if (Array.isArray(payload.data)) {
      return payload.data;
    }

    if (payload.response && typeof payload.response === 'object') {
      return Object.keys(payload.response).map(function (name) {
        return {
          name: name,
          available: String(payload.response[name] || '').toLowerCase() === 'available'
        };
      });
    }

    if (payload.availability && typeof payload.availability === 'object') {
      return Object.keys(payload.availability).map(function (name) {
        return {
          name: name,
          available: !!payload.availability[name]
        };
      });
    }

    return root ? buildDomainOptions(root) : [];
  };

  var renderDomainOptions = function (options) {
    if (!domainResults) {
      return;
    }

    if (!options || options.length === 0) {
      domainResults.innerHTML = '';
      return;
    }

    domainResults.innerHTML = options
      .map(function (option) {
        var selected = projectFlowState.selectedDomain && projectFlowState.selectedDomain.name === option.name;
        var className = 'domain-row' + (option.available ? '' : ' is-unavailable') + (selected ? ' is-selected' : '');
        var priceLabel = typeof option.price === 'number' ? formatCurrency(option.price) + '/yr' : 'TBD';
        return (
          '<div class="' +
          className +
          '">' +
          '<div class="meta"><span class="name">' +
          escapeHtml(option.name) +
          '</span><span class="cost">' +
          priceLabel +
          '</span></div>' +
          (option.available
            ? '<button type="button" class="btn btn-secondary btn-inline" data-domain-select="' +
              escapeHtml(option.name) +
              '">Select</button>'
            : '<span class="project-hint">Unavailable</span>') +
          '</div>'
        );
      })
      .join('');

    Array.from(domainResults.querySelectorAll('[data-domain-select]')).forEach(function (button) {
      button.addEventListener('click', function () {
        var name = button.getAttribute('data-domain-select');
        var selectedOption = options.find(function (option) {
          return option.name === name;
        });
        if (!selectedOption || !selectedOption.available) {
          return;
        }
        projectFlowState.selectedDomain = {
          name: selectedOption.name,
          price: selectedOption.price
        };
        renderDomainOptions(options);
        setDomainSelectedLine();
      });
    });
  };

  var syncSubdomainState = function () {
    if (!subdomainList) {
      return;
    }
    var rows = Array.from(subdomainList.querySelectorAll('[data-subdomain-row]'));
    projectFlowState.subdomains = rows
      .map(function (row) {
        var nameInput = row.querySelector('[data-subdomain-name]');
        var purposeInput = row.querySelector('[data-subdomain-purpose]');
        return {
          name: cleanDomainRoot(nameInput ? nameInput.value : ''),
          purpose: purposeInput ? purposeInput.value.trim() : ''
        };
      })
      .filter(function (entry) {
        return entry.name || entry.purpose;
      });
  };

  var createSubdomainRow = function (index, value) {
    var row = document.createElement('div');
    row.className = 'subdomain-row';
    row.setAttribute('data-subdomain-row', 'true');

    row.innerHTML =
      '<div class="subdomain-row-header">' +
      '<p class="subdomain-row-title">Subdomain ' +
      (index + 1) +
      '</p>' +
      (index > 0
        ? '<button type="button" class="btn btn-secondary btn-inline" data-subdomain-remove="true">Remove</button>'
        : '') +
      '</div>' +
      '<div class="subdomain-inputs">' +
      '<div><label class="field-label">Subdomain</label>' +
      '<input class="field-input" type="text" maxlength="40" autocomplete="off" placeholder="app" data-subdomain-name="true" /></div>' +
      '<div><label class="field-label">Purpose</label>' +
      '<input class="field-input" type="text" maxlength="160" autocomplete="off" placeholder="Customer dashboard" data-subdomain-purpose="true" /></div>' +
      '</div>';

    var nameInput = row.querySelector('[data-subdomain-name]');
    var purposeInput = row.querySelector('[data-subdomain-purpose]');
    if (nameInput && value && value.name) {
      nameInput.value = value.name;
    }
    if (purposeInput && value && value.purpose) {
      purposeInput.value = value.purpose;
    }

    if (nameInput) {
      nameInput.addEventListener('input', function () {
        setProjectFlowError('');
      });
    }
    if (purposeInput) {
      purposeInput.addEventListener('input', function () {
        setProjectFlowError('');
      });
    }

    var removeButton = row.querySelector('[data-subdomain-remove]');
    if (removeButton) {
      removeButton.addEventListener('click', function () {
        row.remove();
        refreshSubdomainRowTitles();
        syncSubdomainState();
      });
    }

    return row;
  };

  var refreshSubdomainRowTitles = function () {
    if (!subdomainList) {
      return;
    }
    Array.from(subdomainList.querySelectorAll('[data-subdomain-row]')).forEach(function (row, index) {
      var title = row.querySelector('.subdomain-row-title');
      if (title) {
        title.textContent = 'Subdomain ' + (index + 1);
      }
      var remove = row.querySelector('[data-subdomain-remove]');
      if (remove) {
        remove.style.display = index === 0 ? 'none' : '';
      }
    });
  };

  var renderSubdomainRows = function () {
    if (!subdomainList) {
      return;
    }
    subdomainList.innerHTML = '';
    var rows = projectFlowState.subdomains.length > 0 ? projectFlowState.subdomains : [{ name: '', purpose: '' }];
    rows.forEach(function (entry, index) {
      subdomainList.appendChild(createSubdomainRow(index, entry));
    });
    refreshSubdomainRowTitles();
  };

  var updateSubdomainFields = function () {
    var enabled = !!(useSubdomainCheckbox && useSubdomainCheckbox.checked);
    projectFlowState.useSubdomain = enabled;

    if (subdomainFields) {
      subdomainFields.hidden = !enabled;
    }

    if (!enabled) {
      projectFlowState.subdomains = [];
      if (subdomainList) {
        subdomainList.innerHTML = '';
      }
      return;
    }

    renderSubdomainRows();
  };

  var updateCheckoutSummary = function () {
    var selectedPlan = projectFlowState.planKey ? PLAN_OPTIONS[projectFlowState.planKey] : null;
    var planPrice = selectedPlan ? selectedPlan.price : 0;
    var domainPrice = projectFlowState.selectedDomain ? projectFlowState.selectedDomain.price : 0;
    var total = planPrice + domainPrice;
    var domainName = projectFlowState.selectedDomain ? projectFlowState.selectedDomain.name : projectFlowState.domainRoot;
    var subdomains = projectFlowState.useSubdomain ? projectFlowState.subdomains : [];
    var subdomainNames = subdomains
      .filter(function (item) {
        return item.name;
      })
      .map(function (item) {
        return item.name + (domainName ? '.' + domainName : '');
      });
    var subdomainUses = subdomains
      .filter(function (item) {
        return item.purpose;
      })
      .map(function (item) {
        return item.purpose;
      });

    if (checkoutPlan) {
      checkoutPlan.textContent = selectedPlan ? selectedPlan.label + ' ' + formatCurrency(selectedPlan.price) : '--';
    }
    if (checkoutProjectName) {
      checkoutProjectName.textContent = projectFlowState.projectName || '--';
    }
    if (checkoutDomain) {
      checkoutDomain.textContent = projectFlowState.selectedDomain ? projectFlowState.selectedDomain.name : '--';
    }
    if (checkoutDomainCost) {
      checkoutDomainCost.textContent = formatCurrency(domainPrice);
    }
    if (checkoutSubdomain) {
      checkoutSubdomain.textContent = projectFlowState.useSubdomain ? subdomainNames.join(', ') || '--' : 'None';
    }
    if (checkoutSubdomainUse) {
      checkoutSubdomainUse.textContent = projectFlowState.useSubdomain ? subdomainUses.join(' | ') || '--' : 'N/A';
    }
    if (checkoutTotal) {
      checkoutTotal.textContent = formatCurrency(total);
    }
  };

  var renderProjectFlowStep = function () {
    projectStepPanes.forEach(function (pane, index) {
      var isCurrent = index + 1 === projectFlowStep;
      pane.hidden = !isCurrent;
    });

    projectFlowSteps.forEach(function (item) {
      var itemStep = Number(item.getAttribute('data-step') || 0);
      item.classList.toggle('is-active', itemStep === projectFlowStep);
    });

    if (projectBackButton) {
      projectBackButton.disabled = projectFlowStep === 1;
    }
    if (projectNextButton) {
      projectNextButton.hidden = projectFlowStep === 5;
      projectNextButton.textContent = 'Next';
    }

    if (projectFlowStep === 5) {
      updateCheckoutSummary();
    }
  };

  var validateProjectStep = function (step) {
    if (step === 1) {
      if (!projectFlowState.planKey) {
        setProjectFlowError('Select a plan to continue.');
        return false;
      }
    }

    if (step === 2) {
      projectFlowState.projectName = projectNameInput ? projectNameInput.value.trim() : '';
      projectFlowState.domainRoot = cleanDomainRoot(domainRootInput ? domainRootInput.value : '');

      if (!projectFlowState.projectName) {
        setProjectFlowError('Enter a project name.');
        return false;
      }
      if (!projectFlowState.domainRoot) {
        setProjectFlowError('Enter a domain name and browse pricing.');
        return false;
      }
      if (!projectFlowState.selectedDomain) {
        setProjectFlowError('Select a domain from the pricing list.');
        return false;
      }
    }

    if (step === 3) {
      updateSubdomainFields();
      syncSubdomainState();
      if (projectFlowState.useSubdomain) {
        if (projectFlowState.subdomains.length === 0) {
          setProjectFlowError('Add at least one subdomain.');
          return false;
        }
        var missingName = projectFlowState.subdomains.find(function (item) {
          return !item.name;
        });
        if (missingName) {
          setProjectFlowError('Each subdomain needs a name.');
          return false;
        }
        var missingPurpose = projectFlowState.subdomains.find(function (item) {
          return !item.purpose;
        });
        if (missingPurpose) {
          setProjectFlowError('Each subdomain needs a purpose.');
          return false;
        }
      }
    }

    if (step === 4) {
      projectFlowState.prompt = websitePromptInput ? websitePromptInput.value.trim() : '';
      if (projectFlowState.prompt.length < 20) {
        setProjectFlowError('Add a more detailed website prompt (at least 20 characters).');
        return false;
      }
    }

    setProjectFlowError('');
    return true;
  };

  var resetProjectFlow = function () {
    projectFlowStep = 1;
    projectFlowState = {
      planKey: '',
      projectName: '',
      domainRoot: '',
      selectedDomain: null,
      useSubdomain: false,
      subdomains: [],
      prompt: ''
    };
    setPlanSelection('');
    setProjectFlowError('');
    if (projectNameInput) {
      projectNameInput.value = '';
    }
    if (domainRootInput) {
      domainRootInput.value = '';
    }
    if (domainResults) {
      domainResults.innerHTML = '';
    }
    setDomainSelectedLine();
    if (useSubdomainCheckbox) {
      useSubdomainCheckbox.checked = false;
    }
    if (subdomainFields) {
      subdomainFields.hidden = true;
    }
    if (subdomainList) {
      subdomainList.innerHTML = '';
    }
    if (websitePromptInput) {
      websitePromptInput.value = '';
    }
    updateSubdomainFields();
    renderProjectFlowStep();
  };

  if (sidebar && menuToggle && overlay) {
    menuToggle.addEventListener('click', function () {
      var expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    overlay.addEventListener('click', closeSidebar);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeSidebar();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 920) {
        closeSidebar();
      }
    });
  }

  var setTableRows = function (rows) {
    if (!tableBody) {
      return;
    }

    if (!rows || rows.length === 0) {
      tableBody.innerHTML = '<tr data-status="draft"><td colspan="4">No API records available.</td></tr>';
      return;
    }

    tableBody.innerHTML = rows
      .map(function (row) {
        var status = row.status === 'live' ? 'live' : 'draft';
        return (
          '<tr data-status="' +
          status +
          '">' +
          '<td>' +
          escapeHtml(row.name || 'Unknown') +
          '</td>' +
          '<td><span class="badge ' +
          status +
          '">' +
          (status === 'live' ? 'Live' : 'Draft') +
          '</span></td>' +
          '<td>' +
          escapeHtml(row.role || 'user') +
          '</td>' +
          '<td>' +
          escapeHtml(row.email || 'N/A') +
          '</td>' +
          '</tr>'
        );
      })
      .join('');
  };

  var setActivityItems = function (items) {
    if (!activityList) {
      return;
    }

    currentActivityItems = Array.isArray(items) ? items.slice() : [];

    if (currentActivityItems.length === 0) {
      activityList.innerHTML = '<li><p>Activity feed is clear.</p><span>Now</span></li>';
      return;
    }

    activityList.innerHTML = currentActivityItems
      .map(function (item) {
        return (
          '<li><p>' +
          escapeHtml(item.message) +
          '</p><span>' +
          escapeHtml(item.time) +
          '</span></li>'
        );
      })
      .join('');
  };

  var setupFilters = function () {
    var rows = function () {
      return Array.from(document.querySelectorAll('#project-table-body tr'));
    };

    if (filterButtons.length > 0) {
      filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          var filter = button.getAttribute('data-filter');

          filterButtons.forEach(function (b) {
            b.classList.remove('is-active');
          });
          button.classList.add('is-active');

          rows().forEach(function (row) {
            var status = row.getAttribute('data-status');
            var show = filter === 'all' || filter === status;
            row.hidden = !show;
          });
        });
      });
    }
  };

  setupFilters();

  var toBase64 = function (value) {
    var normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    var remainder = normalized.length % 4;
    return remainder === 0 ? normalized : normalized + '='.repeat(4 - remainder);
  };

  var getFrontendApiFromPublishableKey = function (publishableKey) {
    var parts = String(publishableKey || '').split('_');
    if (parts.length < 3) {
      return '';
    }

    var encoded = parts.slice(2).join('_');
    try {
      return window.atob(toBase64(encoded)).replace(/\$/g, '');
    } catch (error) {
      return '';
    }
  };

  var loadClerkScript = function () {
    return new Promise(function (resolve, reject) {
      if (window.Clerk) {
        resolve(window.Clerk);
        return;
      }

      var frontendApi = getFrontendApiFromPublishableKey(CLERK_PUBLISHABLE_KEY);
      if (!frontendApi) {
        reject(new Error('Invalid Clerk publishable key.'));
        return;
      }

      var script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-clerk-publishable-key', CLERK_PUBLISHABLE_KEY);
      script.src = 'https://' + frontendApi + '/npm/@clerk/clerk-js@5/dist/clerk.browser.js';

      script.onload = function () {
        if (window.Clerk) {
          resolve(window.Clerk);
        } else {
          reject(new Error('Clerk loaded incorrectly.'));
        }
      };

      script.onerror = function () {
        reject(new Error('Failed to load Clerk script.'));
      };

      document.head.appendChild(script);
    });
  };

  var apiRequest = async function (path, options) {
    options = options || {};
    var method = options.method || 'GET';
    var requestHeaders = options.headers ? Object.assign({}, options.headers) : {};
    var requestBody = options.body;

    if (authToken) {
      requestHeaders.Authorization = 'Bearer ' + authToken;
    }
    if (requestBody && !(requestBody instanceof FormData)) {
      requestHeaders['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(requestBody);
    }

    var response = await window.fetch(API_BASE + path, {
      method: method,
      headers: requestHeaders,
      credentials: 'include',
      body: requestBody
    });

    var body = null;
    try {
      var rawText = await response.text();
      body = rawText ? JSON.parse(rawText) : null;
    } catch (parseError) {
      body = null;
    }

    if (!response.ok) {
      var message = 'API request failed';
      if (body && body.error) {
        if (typeof body.error === 'string') {
          message = body.error;
        } else if (typeof body.error.message === 'string') {
          message = body.error.message;
        }
      } else if (body && typeof body.message === 'string') {
        message = body.message;
      } else {
        message = response.status + ' ' + response.statusText;
      }

      var requestError = new Error(message);
      requestError.status = response.status;
      throw requestError;
    }

    return body || {};
  };

  var applySummary = function (me, users, health, usedAdminSource) {
    var metadata = me.publicMetadata || {};

    if (profileName) {
      profileName.textContent = getUserDisplayName(me);
    }

    var projectsCount = null;
    if (usedAdminSource && Array.isArray(users)) {
      projectsCount = users.length;
    } else if (hasOwn(metadata, 'activeProjects')) {
      projectsCount = parseOptionalNumber(metadata.activeProjects);
    }

    var successRate = hasOwn(metadata, 'successRate') ? parseOptionalNumber(metadata.successRate) : null;
    var deploySeconds = hasOwn(metadata, 'avgDeploySeconds') ? parseOptionalNumber(metadata.avgDeploySeconds) : null;
    var leadsCount = hasOwn(metadata, 'leadsCaptured') ? parseOptionalNumber(metadata.leadsCaptured) : null;

    kpiProjects.textContent = projectsCount === null ? '--' : formatNumber(projectsCount);
    kpiSuccess.textContent = successRate === null ? '--' : formatNumber(successRate) + '%';
    kpiDeploy.textContent = deploySeconds === null ? '--' : formatNumber(deploySeconds) + 's';
    kpiLeads.textContent = leadsCount === null ? '--' : formatNumber(leadsCount);

    kpiProjectsDelta.textContent = '';
    kpiSuccessDelta.textContent = '';
    kpiDeployDelta.textContent = '';
    kpiLeadsDelta.textContent = '';
    setStatus('', health && health.ok ? 'success' : '');
  };

  var signOut = function () {
    if (clerkInstance) {
      clerkInstance.signOut().finally(function () {
        window.location.href = LOGIN_URL;
      });
      return;
    }
    window.location.href = LOGIN_URL;
  };

  var saveProfileName = async function (event) {
    event.preventDefault();

    if (!currentUser) {
      setStatus('Profile is not loaded yet.', 'error');
      return;
    }

    var nextFirstName = settingsFirstNameInput ? settingsFirstNameInput.value.trim() : '';
    var nextLastName = settingsLastNameInput ? settingsLastNameInput.value.trim() : '';
    if (!nextFirstName && !nextLastName) {
      setSettingsFeedback('Please enter at least a first name or last name.', true);
      return;
    }

    try {
      var payload = {
        firstName: nextFirstName,
        lastName: nextLastName
      };
      var updateResponse = await apiRequest('/me', { method: 'PATCH', body: payload });
      var updatedUser = updateResponse.user || updateResponse.data || updateResponse.result || {};
      currentUser = Object.assign({}, currentUser, payload, updatedUser);

      if (profileName) {
        profileName.textContent = getUserDisplayName(currentUser);
      }
      syncProfileFields(currentUser);
      pushActivity('Profile name updated.');
      setSettingsFeedback('Name updated successfully.', false);
      setStatus('', '');
    } catch (error) {
      var message = error && error.message ? error.message : 'Unable to update profile.';
      setSettingsFeedback('Profile update failed: ' + message, true);
    }
  };

  var updateProfilePhoto = async function (event) {
    event.preventDefault();

    var file = settingsPhotoFileInput && settingsPhotoFileInput.files ? settingsPhotoFileInput.files[0] : null;
    if (!file) {
      setSettingsFeedback('Please choose an image file first.', true);
      return;
    }

    try {
      if (clerkInstance && clerkInstance.user && typeof clerkInstance.user.setProfileImage === 'function') {
        await clerkInstance.user.setProfileImage({ file: file });
        if (!currentUser) {
          currentUser = {};
        }
        if (clerkInstance.user.imageUrl) {
          currentUser.imageUrl = clerkInstance.user.imageUrl;
        }
      } else {
        var uploadFormData = new FormData();
        uploadFormData.append('file', file);
        var uploadResponse = await apiRequest('/me/profile-image', {
          method: 'POST',
          body: uploadFormData
        });
        var uploadUser = uploadResponse.user || uploadResponse.data || uploadResponse.result || uploadResponse;
        if (uploadUser && uploadUser.imageUrl) {
          if (!currentUser) {
            currentUser = {};
          }
          currentUser.imageUrl = uploadUser.imageUrl;
        }
      }

      syncProfileFields(currentUser);
      if (settingsPhotoFileInput) {
        settingsPhotoFileInput.value = '';
      }
      updatePhotoFileNameLabel();
      pushActivity('Profile picture updated.');
      setSettingsFeedback('Profile picture updated successfully.', false);
    } catch (error) {
      var photoMessage = error && error.message ? error.message : 'Unable to update profile image.';
      setSettingsFeedback('Profile image update failed: ' + photoMessage, true);
    }
  };

  var addBackupEmail = async function (event) {
    event.preventDefault();

    var backupEmail = settingsBackupEmailInput ? settingsBackupEmailInput.value.trim().toLowerCase() : '';
    if (!backupEmail) {
      setSettingsFeedback('Enter a backup email address.', true);
      return;
    }

    var primaryEmail = getUserEmail(currentUser).toLowerCase();
    if (backupEmail === primaryEmail) {
      setSettingsFeedback('Backup email must be different from your primary email.', true);
      return;
    }

    try {
      if (clerkInstance && clerkInstance.user && typeof clerkInstance.user.createEmailAddress === 'function') {
        await clerkInstance.user.createEmailAddress({ emailAddress: backupEmail });
      } else {
        await apiRequest('/me/backup-email', {
          method: 'POST',
          body: { email: backupEmail }
        });
      }

      if (settingsBackupEmailInput) {
        settingsBackupEmailInput.value = '';
      }
      pushActivity('Backup email added: ' + backupEmail + '.');
      setSettingsFeedback('Backup email added. Check your inbox to verify it.', false);
    } catch (error) {
      var emailMessage = error && error.message ? error.message : 'Unable to add backup email.';
      setSettingsFeedback('Backup email update failed: ' + emailMessage, true);
    }
  };

  var changePassword = async function (event) {
    event.preventDefault();

    var currentPassword = settingsCurrentPasswordInput ? settingsCurrentPasswordInput.value : '';
    var newPassword = settingsNewPasswordInput ? settingsNewPasswordInput.value : '';
    var confirmPassword = settingsConfirmPasswordInput ? settingsConfirmPasswordInput.value : '';

    if (!currentPassword || !newPassword || !confirmPassword) {
      setSettingsFeedback('Complete all password fields.', true);
      return;
    }

    if (newPassword.length < 8) {
      setSettingsFeedback('New password must be at least 8 characters.', true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setSettingsFeedback('New password and confirmation do not match.', true);
      return;
    }

    try {
      var changedInClerk = false;
      if (clerkInstance && clerkInstance.user) {
        if (typeof clerkInstance.user.updatePassword === 'function') {
          await clerkInstance.user.updatePassword({
            currentPassword: currentPassword,
            newPassword: newPassword
          });
          changedInClerk = true;
        } else if (typeof clerkInstance.user.update === 'function') {
          await clerkInstance.user.update({
            currentPassword: currentPassword,
            password: newPassword
          });
          changedInClerk = true;
        }
      }

      if (!changedInClerk) {
        await apiRequest('/me/password', {
          method: 'PATCH',
          body: {
            currentPassword: currentPassword,
            newPassword: newPassword
          }
        });
      }

      if (settingsCurrentPasswordInput) {
        settingsCurrentPasswordInput.value = '';
      }
      if (settingsNewPasswordInput) {
        settingsNewPasswordInput.value = '';
      }
      if (settingsConfirmPasswordInput) {
        settingsConfirmPasswordInput.value = '';
      }
      pushActivity('Password updated.');
      setSettingsFeedback('Password changed successfully.', false);
    } catch (error) {
      var passwordMessage = error && error.message ? error.message : 'Unable to change password.';
      setSettingsFeedback('Password change failed: ' + passwordMessage, true);
    }
  };

  var wireButtons = function () {
    var openNewProject = function () {
      resetProjectFlow();
      setCurrentView('new-project', true);
      if (planCards.length > 0) {
        planCards[0].focus();
      }
    };

    if (sidebarCreateProject) {
      sidebarCreateProject.addEventListener('click', openNewProject);
    }

    if (newProjectButton) {
      newProjectButton.addEventListener('click', openNewProject);
    }

    if (exportButton) {
      exportButton.addEventListener('click', function () {
        var rows = Array.from(document.querySelectorAll('#project-table-body tr:not([hidden])'));
        var lines = ['name,status,role,email'];
        rows.forEach(function (row) {
          var cells = Array.from(row.querySelectorAll('td')).map(function (cell) {
            return cell.textContent.trim().replaceAll(',', ' ');
          });
          if (cells.length >= 4) {
            lines.push(cells.join(','));
          }
        });

        var blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'hyprbuild-dashboard-export.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    }

    routeLinks.forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var route = link.getAttribute('data-route') || 'overview';
        setCurrentView(route, true);
        closeSidebar();
      });
    });

    window.addEventListener('hashchange', function () {
      setCurrentView(getRouteFromHash(), false);
    });

    if (profileButton) {
      profileButton.addEventListener('click', function () {
        setCurrentView('settings', true);
        if (settingsFirstNameInput) {
          settingsFirstNameInput.focus();
        }
        closeSidebar();
      });
    }

    if (settingsNameForm) {
      settingsNameForm.addEventListener('submit', function (event) {
        void saveProfileName(event);
      });
    }

    if (settingsPhotoForm) {
      settingsPhotoForm.addEventListener('submit', function (event) {
        void updateProfilePhoto(event);
      });
    }

    if (settingsPhotoFileInput) {
      settingsPhotoFileInput.addEventListener('change', updatePhotoFileNameLabel);
    }

    if (settingsEmailForm) {
      settingsEmailForm.addEventListener('submit', function (event) {
        void addBackupEmail(event);
      });
    }

    if (settingsPasswordForm) {
      settingsPasswordForm.addEventListener('submit', function (event) {
        void changePassword(event);
      });
    }

    if (settingsSignoutButton) {
      settingsSignoutButton.addEventListener('click', signOut);
    }

    if (clearActivityButton) {
      clearActivityButton.addEventListener('click', function () {
        setActivityItems([]);
      });
    }

    planCards.forEach(function (card) {
      card.addEventListener('click', function () {
        setPlanSelection(card.getAttribute('data-plan-key') || '');
        setProjectFlowError('');
      });
    });

    if (domainCheckButton) {
      domainCheckButton.addEventListener('click', async function () {
        var domainRoot = cleanDomainRoot(domainRootInput ? domainRootInput.value : '');
        projectFlowState.domainRoot = domainRoot;
        if (!domainRoot) {
          if (domainResults) {
            domainResults.innerHTML = '';
          }
          projectFlowState.selectedDomain = null;
          setDomainSelectedLine();
          setProjectFlowError('Enter a valid domain name to browse pricing.');
          return;
        }
        try {
          if (domainCheckButton) {
            domainCheckButton.disabled = true;
            domainCheckButton.textContent = 'Searching...';
          }
          var response = await apiRequest('/domains/search?name=' + encodeURIComponent(domainRoot));
          var rawList = normalizeDomainResponse(response, domainRoot);
          var options = rawList.map(function (entry) {
            if (typeof entry === 'string') {
              return {
                name: entry,
                available: true,
                price: priceFromName(entry) || 0
              };
            }
            var name = entry.name || entry.domain || entry.fqdn || '';
            var available = entry.available;
            if (available === undefined || available === null) {
              if (entry.status) {
                available = String(entry.status).toLowerCase() === 'available';
              }
            }
            if (available === undefined || available === null) {
              available = true;
            }
            var price = parseOptionalNumber(entry.price || entry.cost || entry.registrationPrice || entry.yearlyPrice);
            if (price === null) {
              price = priceFromName(name);
            }
            return {
              name: name,
              available: !!available,
              price: typeof price === 'number' ? price : 0
            };
          });
          if (options.length === 0) {
            setProjectFlowError('No domain results returned. Try another name.');
          } else {
            setProjectFlowError('');
          }
          if (projectFlowState.selectedDomain && !projectFlowState.selectedDomain.name.startsWith(domainRoot + '.')) {
            projectFlowState.selectedDomain = null;
          }
          renderDomainOptions(options);
          setDomainSelectedLine();
        } catch (error) {
          if (domainResults) {
            domainResults.innerHTML = '';
          }
          projectFlowState.selectedDomain = null;
          setDomainSelectedLine();
          var message = error && error.message ? error.message : 'Domain lookup failed.';
          setProjectFlowError(message);
        } finally {
          if (domainCheckButton) {
            domainCheckButton.disabled = false;
            domainCheckButton.textContent = 'Browse Prices';
          }
        }
      });
    }

    if (domainRootInput) {
      domainRootInput.addEventListener('input', function () {
        var root = cleanDomainRoot(domainRootInput.value);
        if (projectFlowState.selectedDomain && !projectFlowState.selectedDomain.name.startsWith(root + '.')) {
          projectFlowState.selectedDomain = null;
          setDomainSelectedLine();
        }
      });
    }

    if (projectNameInput) {
      projectNameInput.addEventListener('input', function () {
        if (!domainRootInput) {
          return;
        }
        if (domainRootInput.value.trim()) {
          return;
        }
        domainRootInput.value = cleanDomainRoot(projectNameInput.value);
      });
    }

    if (useSubdomainCheckbox) {
      useSubdomainCheckbox.addEventListener('change', function () {
        updateSubdomainFields();
        setProjectFlowError('');
      });
    }

    if (addSubdomainButton) {
      addSubdomainButton.addEventListener('click', function () {
        if (!subdomainList) {
          return;
        }
        var index = subdomainList.querySelectorAll('[data-subdomain-row]').length;
        subdomainList.appendChild(createSubdomainRow(index, { name: '', purpose: '' }));
        refreshSubdomainRowTitles();
      });
    }

    if (projectBackButton) {
      projectBackButton.addEventListener('click', function () {
        if (projectFlowStep > 1) {
          projectFlowStep -= 1;
          setProjectFlowError('');
          renderProjectFlowStep();
        }
      });
    }

    if (projectNextButton) {
      projectNextButton.addEventListener('click', function () {
        if (!validateProjectStep(projectFlowStep)) {
          return;
        }
        if (projectFlowStep < 5) {
          projectFlowStep += 1;
          renderProjectFlowStep();
        }
      });
    }

    if (checkoutButton) {
      checkoutButton.addEventListener('click', function () {
        setProjectFlowError('Checkout integration is next. Your project setup is ready.');
      });
    }
  };

  var buildRowsFromUsers = function (users) {
    return users.map(function (user) {
      var role = normalizeRole(user.role);
      return {
        name: getUserDisplayName(user),
        status: role === 'admin' ? 'live' : 'draft',
        role: role,
        email: getUserEmail(user)
      };
    });
  };

  var buildActivityFromUsers = function (users, me, usedAdminSource) {
    var items = [];
    var meRole = normalizeRole(me && me.role);

    if (me) {
      items.push({
        message: 'Authenticated as ' + getUserDisplayName(me),
        time: 'Now'
      });
    }

    if (usedAdminSource) {
      users
        .filter(function (user) {
          return !me || user.id !== me.id;
        })
        .slice(0, 3)
        .forEach(function (user, index) {
          items.push({
            message: getUserDisplayName(user) + ' synced from /api/admin/users as ' + normalizeRole(user.role),
            time: index === 0 ? 'Just now' : index + 'm ago'
          });
        });
    } else if (me) {
      items.push({
        message: 'Profile loaded from /api/me as ' + meRole + '.',
        time: 'Just now'
      });
    }

    if (items.length === 0) {
      items.push({ message: 'Activity feed is clear.', time: 'Now' });
    }

    return items;
  };

  var boot = async function () {
    wireButtons();
    resetProjectFlow();
    updatePhotoFileNameLabel();
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#overview');
    }
    setCurrentView(getRouteFromHash(), false);
    setStatus('Initializing secure session...', '');

    try {
      var clerk = await loadClerkScript();
      await clerk.load();
      clerkInstance = clerk;

      if (!clerk.user || !clerk.session) {
        window.location.href = LOGIN_URL;
        return;
      }

      authToken = (await clerk.session.getToken()) || '';
      if (!authToken) {
        window.location.href = LOGIN_URL;
        return;
      }

      var healthPromise = apiRequest('/health');
      var meResponse = await apiRequest('/me');
      var meUser = meResponse.user || meResponse.data || meResponse.result || null;

      if (!meUser || !meUser.id) {
        throw new Error('No user payload returned from /api/me');
      }

      currentUser = meUser;
      syncProfileFields(meUser);

      var users = [];
      var usedAdminSource = false;
      if (normalizeRole(meUser.role) === 'admin') {
        try {
          var adminResponse = await apiRequest('/admin/users');
          if (Array.isArray(adminResponse.users)) {
            users = adminResponse.users;
          } else if (Array.isArray(adminResponse.data)) {
            users = adminResponse.data;
          } else if (Array.isArray(adminResponse.result)) {
            users = adminResponse.result;
          } else {
            users = [];
          }
          usedAdminSource = users.length > 0;
        } catch (adminError) {
          users = [];
          usedAdminSource = false;
        }
      }

      setTableRows(buildRowsFromUsers(users));
      setActivityItems(buildActivityFromUsers(users, meUser, usedAdminSource));

      var health = null;
      try {
        health = await healthPromise;
      } catch (healthError) {
        health = null;
      }

      applySummary(meUser, users, health, usedAdminSource);
    } catch (error) {
      var message = error && error.message ? error.message : 'Unknown dashboard error.';
      setStatus('API connection failed: ' + message, 'error');
      kpiProjects.textContent = '--';
      kpiSuccess.textContent = '--';
      kpiDeploy.textContent = '--';
      kpiLeads.textContent = '--';
      kpiProjectsDelta.textContent = '';
      kpiSuccessDelta.textContent = '';
      kpiDeployDelta.textContent = '';
      kpiLeadsDelta.textContent = '';
      setTableRows([]);
      setActivityItems([
        {
          message: 'Could not load dashboard data from API.',
          time: 'Now'
        }
      ]);
    }
  };

  boot();
})();
