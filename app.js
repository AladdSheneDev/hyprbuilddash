(function () {
  var API_BASE =
    window.location.hostname === 'hyprbuild.app' || window.location.hostname === 'dash.hyprbuild.app'
      ? window.location.origin + '/api'
      : 'https://hyprbuild.app/api';
  var LOGIN_URL = 'https://hyprbuild.app/login.html?next=' + encodeURIComponent(window.location.href);
  var CLERK_PUBLISHABLE_KEY = 'pk_live_Y2xlcmsuaHlwcmJ1aWxkLmFwcCQ';
  var STRIPE_PUBLISHABLE_KEY = 'pk_test_51T5sJMRyj5W9Y3yO8acP7tU26tt1TF6zZ5QAH7Fuv1pEvsRLKeiTc43MS5tR0WXeWGGodVg2EsW5ntnRQMHM2gR9009db1jgZD';
  /**
   * @typedef {import('./types/ai-generation').AiGenerationRequest} AiGenerationRequest
   * @typedef {import('./types/ai-generation').AiGenerationResponse} AiGenerationResponse
   */

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
  var projectFlowIntro = document.getElementById('project-flow-intro');
  var projectNameInput = document.getElementById('project-name-inline-input');
  var projectNameDisplay = document.getElementById('project-name-display');
  var projectNameSetButton = document.getElementById('project-name-set-button');
  var projectNameSaveStatus = document.getElementById('project-name-save-status');
  var domainRootInput = document.getElementById('domain-root-input');
  var domainCheckButton = document.getElementById('domain-check-button');
  var projectDomainArrow = document.getElementById('project-domain-arrow');
  var presetDomainButtons = Array.from(document.querySelectorAll('[data-domain-preset]'));
  var domainResults = document.getElementById('domain-results');
  var selectedDomainLine = document.getElementById('selected-domain-line');
  var websitePromptInput = document.getElementById('website-prompt-input');
  var projectPlanArrow = document.getElementById('project-plan-arrow');
  var projectAssetInput = document.getElementById('project-asset-input');
  var projectAssetAddButton = document.getElementById('project-asset-add-button');
  var projectAssetsList = document.getElementById('project-assets-list');
  var projectPlanLoading = document.getElementById('project-plan-loading');
  var projectPlanSummary = document.getElementById('project-plan-summary');
  var projectPlanSummaryText = document.getElementById('project-plan-summary-text');
  var projectPlanChat = document.getElementById('project-plan-chat');
  var projectPlanChatLog = document.getElementById('project-plan-chat-log');
  var projectPlanChatInput = document.getElementById('project-plan-chat-input');
  var projectPlanChatSend = document.getElementById('project-plan-chat-send');
  var projectBuildArrow = document.getElementById('project-build-arrow');
  var buildProgressLabel = document.getElementById('build-progress-label');
  var buildTaskItems = Array.from(document.querySelectorAll('#project-build-tasks [data-build-task]'));
  var buildPreviewArrow = document.getElementById('build-preview-arrow');
  var projectPreviewButton = document.getElementById('project-preview-button');
  var projectPublishButton = document.getElementById('project-publish-button');
  var projectPreviewWrap = document.getElementById('project-preview-wrap');
  var projectPreviewFrame = document.getElementById('project-preview-frame');
  var publishContinueArrow = document.getElementById('publish-continue-arrow');
  var projectCloseSaveButton = document.getElementById('project-close-save-button');
  var projectPublishStatus = document.getElementById('project-publish-status');
  var projectCyclePrev = document.getElementById('project-cycle-prev');
  var projectCycleNext = document.getElementById('project-cycle-next');
  
  // payment step DOM refs
  var paymentProjectName = document.getElementById('payment-project-name');
  var paymentDomain = document.getElementById('payment-domain');
  var paymentDomainCost = document.getElementById('payment-domain-cost');
  var paymentTotal = document.getElementById('payment-total');
  var paymentButton = document.getElementById('payment-button');
  if (paymentButton && STRIPE_PUBLISHABLE_KEY) {
    paymentButton.setAttribute('data-stripe-publishable-key', STRIPE_PUBLISHABLE_KEY);
  }
  var useSubdomainCheckbox = document.getElementById('use-subdomain-checkbox');
  var subdomainFields = document.getElementById('subdomain-fields');
  var subdomainList = document.getElementById('subdomain-list');
  var addSubdomainButton = document.getElementById('add-subdomain-button');
  var aiProjectIdInput = document.getElementById('ai-project-id-input');
  var generationImagesList = document.getElementById('generation-images-list');
  var addGenerationImageButton = document.getElementById('add-generation-image-button');
  var projectBackButton = document.getElementById('project-back-button');
  var projectNextButton = document.getElementById('project-next-button');
  var checkoutButton = document.getElementById('checkout-button');
  var aiRetryButton = document.getElementById('ai-retry-button');
  var aiGenerationFeedback = document.getElementById('ai-generation-feedback');
  var aiGenerationResults = document.getElementById('ai-generation-results');
  var aiPlannerSummary = document.getElementById('ai-planner-summary');
  var aiBackendContracts = document.getElementById('ai-backend-contracts');
  var aiBackendFiles = document.getElementById('ai-backend-files');
  var aiRefinementCycles = document.getElementById('ai-refinement-cycles');
  var aiPagesList = document.getElementById('ai-pages-list');
  var aiTesterStatus = document.getElementById('ai-tester-status');
  var aiTesterScore = document.getElementById('ai-tester-score');
  var aiTesterIssues = document.getElementById('ai-tester-issues');
  var aiUsageTotalCalls = document.getElementById('ai-usage-total-calls');
  var aiUsageInputTokens = document.getElementById('ai-usage-input-tokens');
  var aiUsageOutputTokens = document.getElementById('ai-usage-output-tokens');
  var aiUsageByAgent = document.getElementById('ai-usage-by-agent');
  var checkoutPlan = document.getElementById('checkout-plan');
  var checkoutProjectName = document.getElementById('checkout-project-name');
  var checkoutProjectId = document.getElementById('checkout-project-id');
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
  var waitingMessage = document.getElementById('waiting-message');
  var currentActivityItems = [];
  var currentView = 'overview';
  var projectFlowStep = 1;
  var projectFlowState = {
    projectId: '',
    projectName: '',
    nameSaved: false,
    domainRoot: '',
    selectedDomain: null,
    promptAssets: [],
    prompt: '',
    planSummary: '',
    planReady: false,
    chatHistory: [],
    paid: false,              
    buildCompleted: false,
    previewUrl: '',
    publishCompleted: false
  };
// i have to get ICANN certifcation.
// So if your on the waitlist 
// reading this
// this is one of the reason why
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

  var slugifyProjectId = function (value) {
    return String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  var ensureProjectId = function () {
    if (projectFlowState.projectId) {
      return projectFlowState.projectId;
    }

    var nameSeed = projectFlowState.projectName || (projectNameInput ? projectNameInput.value.trim() : '');
    var baseSeed = slugifyProjectId(nameSeed || 'hyprbuild-project');
    var derivedId = baseSeed || 'hyprbuild-project';

    projectFlowState.projectId = derivedId;
    return derivedId;
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

  var checkUserVerification = function (user) {
    if (!user) {
      return false;
    }
    var userEmail = getUserEmail(user).toLowerCase();
    var userId = user.id || '';
    var isVerified =
      userEmail === 'aladdinshenewa@outlook.com' && userId === 'user_39yQlq5ya1GnuppSSQnYPwjO9YP';
    console.log('Verification check - Email:', userEmail, 'User ID:', userId, 'Verified:', isVerified);
    return isVerified;
  };

  var applyAccessRestrictions = function () {
    console.log('Applying access restrictions - waiting message element:', waitingMessage);
    if (!waitingMessage) {
      console.log('WARNING: waiting message element not found');
      return;
    }
    
    // Hide entire interface
    if (sidebar) {
      sidebar.style.display = 'none';
    }
    var header = document.querySelector('.topbar');
    if (header) {
      header.style.display = 'none';
    }
    if (viewOverview) {
      viewOverview.hidden = true;
    }
    if (viewNewProject) {
      viewNewProject.hidden = true;
    }
    
    // Show waiting message
    waitingMessage.hidden = false;
    var appShell = document.querySelector('.app-shell');
    if (appShell) {
      appShell.style.gridTemplateColumns = '1fr';
    }
    
    console.log('Waiting message shown, interface hidden');
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

  var setAiGenerationFeedback = function (message, kind) {
    if (!aiGenerationFeedback) {
      return;
    }
    aiGenerationFeedback.textContent = message || '';
    aiGenerationFeedback.classList.remove('is-error', 'is-success');
    if (kind === 'error') {
      aiGenerationFeedback.classList.add('is-error');
    }
    if (kind === 'success') {
      aiGenerationFeedback.classList.add('is-success');
    }
  };

  var readFileAsDataUrl = function (file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(String(reader.result || ''));
      };
      reader.onerror = function () {
        reject(new Error('Could not read selected image file.'));
      };
      reader.readAsDataURL(file);
    });
  };

  var setListMarkup = function (element, items, emptyText) {
    if (!element) {
      return;
    }
    if (!Array.isArray(items) || items.length === 0) {
      element.innerHTML = '<li>' + escapeHtml(emptyText) + '</li>';
      return;
    }
    element.innerHTML = items
      .map(function (item) {
        return '<li>' + escapeHtml(item) + '</li>';
      })
      .join('');
  };

  var countEntries = function (value) {
    if (Array.isArray(value)) {
      return value.length;
    }
    if (value && typeof value === 'object') {
      return Object.keys(value).length;
    }
    return 0;
  };

  var getPlannerSummary = function (planner) {
    if (!planner) {
      return 'No planner output returned.';
    }
    if (typeof planner === 'string') {
      return planner;
    }
    if (typeof planner.summary === 'string' && planner.summary.trim()) {
      return planner.summary.trim();
    }
    if (typeof planner.overview === 'string' && planner.overview.trim()) {
      return planner.overview.trim();
    }
    if (Array.isArray(planner.goals) && planner.goals.length > 0) {
      return planner.goals
        .slice(0, 3)
        .map(function (goal) {
          return String(goal);
        })
        .join(' | ');
    }
    var keys = Object.keys(planner);
    return keys.length > 0 ? keys.length + ' planner sections generated.' : 'No planner output returned.';
  };

  var normalizeIssue = function (issue) {
    if (typeof issue === 'string') {
      return issue;
    }
    if (issue && typeof issue === 'object') {
      if (typeof issue.message === 'string' && issue.message.trim()) {
        return issue.message.trim();
      }
      if (typeof issue.title === 'string' && issue.title.trim()) {
        return issue.title.trim();
      }
      return JSON.stringify(issue);
    }
    return String(issue);
  };

  var normalizePageOutput = function (page, index) {
    if (typeof page === 'string') {
      return page;
    }
    if (!page || typeof page !== 'object') {
      return 'Page ' + (index + 1);
    }
    var label = page.title || page.name || page.route || page.slug || page.path || 'Page ' + (index + 1);
    var detail = page.path || page.route || page.url || '';
    return detail && detail !== label ? String(label) + ' (' + String(detail) + ')' : String(label);
  };

  var normalizeAgentUsage = function (name, details) {
    if (typeof details === 'number') {
      return name + ': ' + formatNumber(details) + ' calls';
    }
    if (details && typeof details === 'object') {
      var calls = parseOptionalNumber(details.calls);
      var inputTokens = parseOptionalNumber(details.inputTokens || details.totalInputTokens);
      var outputTokens = parseOptionalNumber(details.outputTokens || details.totalOutputTokens);
      var segments = [];
      if (calls !== null) {
        segments.push(formatNumber(calls) + ' calls');
      }
      if (inputTokens !== null) {
        segments.push(formatNumber(inputTokens) + ' in');
      }
      if (outputTokens !== null) {
        segments.push(formatNumber(outputTokens) + ' out');
      }
      return segments.length > 0 ? name + ': ' + segments.join(', ') : name + ': usage recorded';
    }
    return name + ': usage recorded';
  };

  var renderAiGenerationResults = function (result) {
    if (aiGenerationResults) {
      aiGenerationResults.hidden = false;
    }

    if (aiPlannerSummary) {
      aiPlannerSummary.textContent = getPlannerSummary(result ? result.planner : null);
    }

    var backend = result && result.backend ? result.backend : {};
    var contractsCount = countEntries(backend.contracts || backend.apiContracts || backend.endpoints);
    var filesCount = countEntries(backend.files || backend.generatedFiles || backend.fileMap || backend.artifacts);
    if (aiBackendContracts) {
      aiBackendContracts.textContent = formatNumber(contractsCount);
    }
    if (aiBackendFiles) {
      aiBackendFiles.textContent = formatNumber(filesCount);
    }
    if (aiRefinementCycles) {
      var cycles = result && hasOwn(result, 'refinementCycles') ? parseOptionalNumber(result.refinementCycles) : null;
      aiRefinementCycles.textContent = cycles === null ? '--' : formatNumber(cycles);
    }

    var pageOutputs = Array.isArray(result && result.pages)
      ? result.pages.map(function (page, index) {
          return normalizePageOutput(page, index);
        })
      : [];
    setListMarkup(aiPagesList, pageOutputs, 'No pages generated yet.');

    var tester = result && result.tester ? result.tester : {};
    if (aiTesterStatus) {
      aiTesterStatus.textContent = tester.status ? String(tester.status).toUpperCase() : '--';
    }
    if (aiTesterScore) {
      var testerScore = hasOwn(tester, 'score') ? parseOptionalNumber(tester.score) : null;
      aiTesterScore.textContent = testerScore === null ? '--' : formatNumber(testerScore);
    }
    var issues = Array.isArray(tester.issues)
      ? tester.issues.map(function (issue) {
          return normalizeIssue(issue);
        })
      : [];
    setListMarkup(aiTesterIssues, issues, 'No tester issues.');

    var usage = result && result.usage ? result.usage : {};
    if (aiUsageTotalCalls) {
      var totalCalls = hasOwn(usage, 'totalCalls') ? parseOptionalNumber(usage.totalCalls) : null;
      aiUsageTotalCalls.textContent = totalCalls === null ? '--' : formatNumber(totalCalls);
    }
    if (aiUsageInputTokens) {
      var inputTokens = hasOwn(usage, 'totalInputTokens') ? parseOptionalNumber(usage.totalInputTokens) : null;
      aiUsageInputTokens.textContent = inputTokens === null ? '--' : formatNumber(inputTokens);
    }
    if (aiUsageOutputTokens) {
      var outputTokens = hasOwn(usage, 'totalOutputTokens') ? parseOptionalNumber(usage.totalOutputTokens) : null;
      aiUsageOutputTokens.textContent = outputTokens === null ? '--' : formatNumber(outputTokens);
    }

    var byAgent = usage && usage.byAgent && typeof usage.byAgent === 'object' ? usage.byAgent : {};
    var byAgentItems = Object.keys(byAgent).map(function (name) {
      return normalizeAgentUsage(name, byAgent[name]);
    });
    setListMarkup(aiUsageByAgent, byAgentItems, 'No usage data yet.');
  };

  var resetAiGenerationUi = function () {
    setAiGenerationFeedback('', '');
    if (aiGenerationResults) {
      aiGenerationResults.hidden = true;
    }
    if (aiRetryButton) {
      aiRetryButton.hidden = true;
    }
    if (checkoutButton) {
      checkoutButton.disabled = false;
      checkoutButton.textContent = 'Generate with AI';
    }
  };

  var refreshGenerationImageLabels = function () {
    if (!generationImagesList) {
      return;
    }
    Array.from(generationImagesList.querySelectorAll('[data-generation-image-row]')).forEach(function (row, index) {
      var title = row.querySelector('.generation-image-title');
      if (title) {
        title.textContent = 'Image ' + (index + 1);
      }
      var fileInput = row.querySelector('[data-generation-image-file]');
      var fileName = row.querySelector('[data-generation-image-file-name]');
      if (fileName) {
        var file = fileInput && fileInput.files ? fileInput.files[0] : null;
        fileName.textContent = file && file.name ? file.name : 'No file selected';
      }
    });
  };

  var createGenerationImageRow = function () {
    var row = document.createElement('div');
    row.className = 'generation-image-row';
    row.setAttribute('data-generation-image-row', 'true');

    row.innerHTML =
      '<div class="generation-image-head">' +
      '<p class="generation-image-title">Image</p>' +
      '<button type="button" class="btn btn-secondary btn-inline" data-generation-image-remove="true">Remove</button>' +
      '</div>' +
      '<div class="generation-image-grid">' +
      '<div>' +
      '<label class="field-label">Image URL</label>' +
      '<input class="field-input" type="url" placeholder="https://example.com/reference.png" data-generation-image-url="true" />' +
      '</div>' +
      '<div>' +
      '<label class="field-label">Or Upload Image</label>' +
      '<input class="generation-file-input" type="file" accept="image/*" data-generation-image-file="true" />' +
      '<div class="generation-file-meta">' +
      '<label class="btn btn-secondary btn-inline" data-generation-image-file-label="true">Select File</label>' +
      '<span class="generation-file-name" data-generation-image-file-name="true">No file selected</span>' +
      '</div>' +
      '</div>' +
      '</div>';

    var fileInput = row.querySelector('[data-generation-image-file]');
    var fileLabel = row.querySelector('[data-generation-image-file-label]');
    if (fileInput && fileLabel) {
      var fileId = 'generation-image-file-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      fileInput.id = fileId;
      fileLabel.setAttribute('for', fileId);
      fileInput.addEventListener('change', function () {
        refreshGenerationImageLabels();
      });
    }

    var removeButton = row.querySelector('[data-generation-image-remove]');
    if (removeButton) {
      removeButton.addEventListener('click', function () {
        row.remove();
        refreshGenerationImageLabels();
      });
    }

    return row;
  };

  var addGenerationImageRow = function () {
    if (!generationImagesList) {
      return;
    }
    generationImagesList.appendChild(createGenerationImageRow());
    refreshGenerationImageLabels();
  };

  var clearGenerationImages = function () {
    if (!generationImagesList) {
      return;
    }
    generationImagesList.innerHTML = '';
  };

  var collectGenerationImages = async function () {
    if (!generationImagesList) {
      return [];
    }

    var rows = Array.from(generationImagesList.querySelectorAll('[data-generation-image-row]'));
    var images = [];

    for (var index = 0; index < rows.length; index += 1) {
      var row = rows[index];
      var urlInput = row.querySelector('[data-generation-image-url]');
      var fileInput = row.querySelector('[data-generation-image-file]');
      var url = urlInput ? urlInput.value.trim() : '';
      var file = fileInput && fileInput.files ? fileInput.files[0] : null;

      if (!url && !file) {
        continue;
      }

      if (url && !file) {
        try {
          new URL(url);
        } catch (error) {
          throw new Error('Image URL ' + (index + 1) + ' is not valid.');
        }
        images.push({ url: url });
        continue;
      }

      if (file) {
        var dataUrl = await readFileAsDataUrl(file);
        images.push({
          dataUrl: dataUrl,
          mimeType: file.type || ''
        });
      }
    }

    return images;
  };

  var getSessionToken = async function () {
    if (clerkInstance && clerkInstance.session && typeof clerkInstance.session.getToken === 'function') {
      authToken = (await clerkInstance.session.getToken()) || authToken;
    }
    return authToken || '';
  };

  var parseValidationMessage = function (payload, fallbackMessage) {
    if (!payload) {
      return fallbackMessage;
    }
    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message.trim();
    }
    if (payload.error && typeof payload.error.message === 'string' && payload.error.message.trim()) {
      return payload.error.message.trim();
    }
    if (Array.isArray(payload.errors) && payload.errors.length > 0) {
      return payload.errors
        .map(function (entry) {
          return normalizeIssue(entry);
        })
        .join(' | ');
    }
    return fallbackMessage;
  };

  var runAiGeneration = async function () {
    projectFlowState.prompt = websitePromptInput ? websitePromptInput.value.trim() : '';
    if (!projectFlowState.prompt) {
      setAiGenerationFeedback('Add a website request before generating.', 'error');
      return;
    }
    projectFlowState.aiProjectId = ensureProjectId();
    if (!projectFlowState.aiProjectId) {
      setAiGenerationFeedback('Project ID is required for AI generation.', 'error');
      return;
    }

    var images = [];
    try {
      images = await collectGenerationImages();
    } catch (error) {
      var imageError = error && error.message ? error.message : 'Image validation failed.';
      setAiGenerationFeedback(imageError, 'error');
      return;
    }

    var token = await getSessionToken();
    if (!token) {
      window.location.href = LOGIN_URL;
      return;
    }

    /** @type {AiGenerationRequest} */
    var payload = {
      projectId: projectFlowState.aiProjectId,
      userRequest: projectFlowState.prompt,
      images: images
    };

    if (checkoutButton) {
      checkoutButton.disabled = true;
      checkoutButton.textContent = 'Generating...';
    }
    if (aiRetryButton) {
      aiRetryButton.hidden = true;
    }
    setAiGenerationFeedback('Running generation pipeline...', '');

    try {
      var response = await window.fetch(API_BASE + '/ai/projects/generate', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      var responsePayload = null;
      try {
        responsePayload = await response.json();
      } catch (parseError) {
        responsePayload = null;
      }

      if (response.status === 401) {
        setAiGenerationFeedback('Session expired. Redirecting to sign in.', 'error');
        window.setTimeout(function () {
          window.location.href = LOGIN_URL;
        }, 400);
        return;
      }
      if (response.status === 400) {
        setAiGenerationFeedback(parseValidationMessage(responsePayload, 'Generation request is invalid.'), 'error');
        return;
      }
      if (response.status === 429) {
        setAiGenerationFeedback('Too many generation requests. Please retry in a moment.', 'error');
        return;
      }
      if (response.status === 403) {
        setAiGenerationFeedback(
          parseValidationMessage(
            responsePayload,
            'Generation blocked. In test mode, projectId must match the backend test project name.'
          ),
          'error'
        );
        return;
      }
      if (response.status === 500 || response.status === 502) {
        setAiGenerationFeedback('Backend generation failed. Please retry shortly.', 'error');
        return;
      }
      if (!response.ok) {
        setAiGenerationFeedback(parseValidationMessage(responsePayload, 'Generation request failed.'), 'error');
        return;
      }

      /** @type {AiGenerationResponse} */
      var result = responsePayload || {};
      renderAiGenerationResults(result);
      projectFlowState.aiProjectId = result.projectId || projectFlowState.aiProjectId;

      var generationFailed = String(result.status || '').toLowerCase() === 'failed';
      var testerFailed = result && result.tester && String(result.tester.status || '').toLowerCase() === 'fail';
      if (generationFailed || testerFailed) {
        if (aiRetryButton) {
          aiRetryButton.hidden = false;
        }
        if (generationFailed) {
          setAiGenerationFeedback('Generation failed. Review results and retry.', 'error');
        } else {
          setAiGenerationFeedback('Generation completed with tester issues. Review issues and retry.', 'error');
        }
      } else {
        setAiGenerationFeedback('Generation completed successfully.', 'success');
      }

      pushActivity('AI generation finished for ' + (projectFlowState.projectName || 'new project') + '.');
    } catch (error) {
      var networkError = error && error.message ? error.message : 'Generation failed.';
      setAiGenerationFeedback(networkError, 'error');
    } finally {
      if (checkoutButton) {
        checkoutButton.disabled = false;
        checkoutButton.textContent = 'Generate with AI';
      }
    }
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
    if (route.startsWith('settings')) {
      return 'settings';
    }
    if (route.startsWith('new-project')) {
      return 'new-project';
    }
    return 'overview';
  };

  var setCurrentView = function (route, syncHash) {
    var routeValue = String(route || '').toLowerCase();
    var nextView = routeValue === 'settings' ? 'settings' : routeValue.indexOf('new-project') === 0 ? 'new-project' : 'overview';
    currentView = nextView;

    // if the hash is instructing a specific step, keep it
    if (nextView === 'new-project') {
      var parts = String(window.location.hash || '').replace(/^#/, '').split('/');
      if (parts.length > 1 && parts[1].startsWith('step')) {
        var stepNum = parseInt(parts[1].replace('step', ''), 10);
        if (!isNaN(stepNum)) {
          projectFlowStep = stepNum;
        }
      }
    }

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
      viewNewProject.style.display = showNewProject ? 'block' : 'none';
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
      var expectedHash = nextView === 'new-project' ? '#new-project/step' + projectFlowStep : '#' + nextView;
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

  var setProjectNameStatus = function (message, isError) {
    if (!projectNameSaveStatus) {
      return;
    }
    projectNameSaveStatus.textContent = message || '';
    projectNameSaveStatus.style.color = isError ? '#fca5a5' : '';
  };

  var getProjectNamePlaceholder = function () {
    var firstName = currentUser && typeof currentUser.firstName === 'string' ? currentUser.firstName.trim() : '';
    return firstName ? firstName + "'s Hyprbuild project" : "Your Hyprbuild project";
  };

  var syncProjectNameDisplay = function () {
    var label = projectFlowState.projectName || getProjectNamePlaceholder();
    if (projectNameDisplay) {
      projectNameDisplay.textContent = label;
      projectNameDisplay.classList.toggle('is-placeholder', !projectFlowState.projectName);
    }
    if (projectNameInput && !projectNameInput.value.trim()) {
      projectNameInput.value = label;
    }
  };

  var beginProjectNameEdit = function () {
    if (!projectNameInput || !projectNameDisplay) {
      return;
    }
    var currentValue = projectFlowState.projectName || projectNameDisplay.textContent || getProjectNamePlaceholder();
    projectNameInput.value = currentValue;
    projectNameInput.hidden = false;
    projectNameDisplay.hidden = true;
    if (projectNameSetButton) {
      projectNameSetButton.hidden = true;
    }
    projectNameInput.focus();
    projectNameInput.select();
  };

  var finishProjectNameEdit = function (cancelEdit) {
    if (!projectNameInput || !projectNameDisplay) {
      return '';
    }
    var nextValue = projectNameInput.value.trim();
    projectNameInput.hidden = true;
    projectNameDisplay.hidden = false;
    if (projectNameSetButton) {
      projectNameSetButton.hidden = false;
    }
    if (cancelEdit) {
      syncProjectNameDisplay();
      return '';
    }
    if (!nextValue) {
      syncProjectNameDisplay();
      return '';
    }
    projectNameDisplay.textContent = nextValue;
    return nextValue;
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

  var setInlineLoadingText = function (element, text) {
    if (!element) {
      return;
    }
    var label = element.querySelector('span:last-child');
    if (label) {
      label.textContent = text;
      return;
    }
    element.textContent = text;
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
        if (domainRootInput) {
          domainRootInput.value = cleanDomainRoot(selectedOption.name);
        }
        projectFlowState.domainRoot = cleanDomainRoot(selectedOption.name);
        projectFlowState.selectedDomain = {
          name: selectedOption.name,
          price: selectedOption.price
        };
        renderDomainOptions(options);
        setDomainSelectedLine();
        setProjectFlowError('');
      });
    });
  };

  var extractProjectId = function (payload) {
    if (!payload || typeof payload !== 'object') {
      return '';
    }
    var data = payload.data && typeof payload.data === 'object' ? payload.data : {};
    var project = payload.project && typeof payload.project === 'object' ? payload.project : {};
    var nestedProject = data.project && typeof data.project === 'object' ? data.project : {};

    var candidateId =
      payload.projectId ||
      payload.id ||
      data.projectId ||
      data.id ||
      project.projectId ||
      project.id ||
      nestedProject.projectId ||
      nestedProject.id;

    return candidateId ? String(candidateId) : '';
  };

  var tryApiCandidates = async function (candidates) {
    var lastError = null;
    for (var index = 0; index < candidates.length; index += 1) {
      var candidate = candidates[index];
      try {
        return await apiRequest(candidate.path, {
          method: candidate.method || 'POST',
          body: candidate.body
        });
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error('Project API request failed.');
  };

  var buildProjectJsonSnapshot = function (stage, extra) {
    var payload = {
      stage: stage || 'draft',
      projectName: projectFlowState.projectName || '',
      projectId: projectFlowState.projectId || '',
      domainRoot: projectFlowState.domainRoot || '',
      selectedDomain: projectFlowState.selectedDomain ? projectFlowState.selectedDomain.name : '',
      prompt: projectFlowState.prompt || '',
      planSummary: projectFlowState.planSummary || '',
      chatHistory: projectFlowState.chatHistory.slice(-20),
      buildCompleted: !!projectFlowState.buildCompleted,
      publishCompleted: !!projectFlowState.publishCompleted,
      assets: projectFlowState.promptAssets.map(function (asset) {
        return {
          id: asset.id,
          name: asset.name,
          mimeType: asset.mimeType,
          size: asset.size || 0,
          kind: asset.kind
        };
      }),
      updatedAt: new Date().toISOString()
    };

    if (extra && typeof extra === 'object') {
      return Object.assign(payload, extra);
    }
    return payload;
  };

  var createProjectRecord = async function (projectName) {
    var response = await apiRequest('/projects', {
      method: 'POST',
      body: {
        name: projectName
      }
    });

    var projectId = extractProjectId(response);
    if (!projectId) {
      throw new Error('Project was created but no backend project ID was returned.');
    }
    projectFlowState.projectId = projectId;
    projectFlowState.nameSaved = true;
    await updateProjectRecord('name_set');
    return response;
  };

  var updateProjectRecord = async function (stage, extra) {
    if (!projectFlowState.projectId) {
      return false;
    }
    var projectId = encodeURIComponent(projectFlowState.projectId);
    var snapshot = buildProjectJsonSnapshot(stage, extra);
    await apiRequest('/projects/' + projectId, {
      method: 'PATCH',
      body: {
        stage: stage || 'project',
        projectJson: snapshot
      }
    });
    return true;
  };

  var applyProjectNameFromFields = function () {
    var manualName = finishProjectNameEdit(false);
    if (manualName) {
      projectFlowState.projectName = manualName;
    } else if (projectNameDisplay && projectNameDisplay.textContent.trim()) {
      projectFlowState.projectName = projectNameDisplay.textContent.trim();
    }
    return projectFlowState.projectName;
  };

  var persistProjectName = async function () {
    applyProjectNameFromFields();
    if (!projectFlowState.projectName) {
      setProjectFlowError('Enter a project name first.');
      setProjectNameStatus('Project name is required.', true);
      beginProjectNameEdit();
      return false;
    }

    var isCreate = !projectFlowState.nameSaved || !projectFlowState.projectId;
    setProjectNameStatus('Saving project name...', false);
    setProjectFlowError('');
    if (projectNameSetButton) {
      projectNameSetButton.disabled = true;
    }

    try {
      if (isCreate) {
        await createProjectRecord(projectFlowState.projectName);
      } else {
        await updateProjectRecord('name_updated');
      }
      setProjectNameStatus('Saved as "' + projectFlowState.projectName + '".', false);
      if (isCreate) {
        pushActivity('Created project "' + projectFlowState.projectName + '".');
      }
      return true;
    } catch (error) {
      var message = error && error.message ? error.message : 'Could not save project name.';
      setProjectFlowError(message);
      setProjectNameStatus(message, true);
      return false;
    } finally {
      if (projectNameSetButton) {
        projectNameSetButton.disabled = false;
      }
    }
  };

  var saveProjectNameAndContinue = async function () {
    var saved = await persistProjectName();
    if (!saved) {
      return false;
    }
    projectFlowStep = 2;
    renderProjectFlowStep();
    return true;
  };

  var navigateProjectFlowToStep = async function (targetStep) {
    var totalSteps = projectStepPanes.length || 7;
    var parsedTarget = Number(targetStep);
    if (!parsedTarget || Number.isNaN(parsedTarget)) {
      return;
    }
    var normalizedTarget = Math.min(totalSteps, Math.max(1, Math.round(parsedTarget)));
    if (normalizedTarget === projectFlowStep) {
      return;
    }

    if (projectFlowStep === 1 && normalizedTarget > 1) {
      var nameNeedsSave =
        !projectFlowState.nameSaved ||
        !projectFlowState.projectId ||
        (projectNameInput && !projectNameInput.hidden);
      if (nameNeedsSave) {
        var nameSaved = await persistProjectName();
        if (!nameSaved) {
          return;
        }
      }
    }

    projectFlowStep = normalizedTarget;
    setProjectFlowError('');
    renderProjectFlowStep();
  };

  var saveDomainAndContinue = async function () {
    projectFlowState.domainRoot = cleanDomainRoot(domainRootInput ? domainRootInput.value : '');
    if (!projectFlowState.domainRoot && projectFlowState.selectedDomain && projectFlowState.selectedDomain.name) {
      projectFlowState.domainRoot = cleanDomainRoot(projectFlowState.selectedDomain.name);
    }

    if (!projectFlowState.domainRoot) {
      setProjectFlowError('Enter a domain name or choose a preset domain.');
      return;
    }

    if (!projectFlowState.selectedDomain) {
      setProjectFlowError('Select a domain from pricing or choose a preset domain.');
      return;
    }

    if (projectDomainArrow) {
      projectDomainArrow.disabled = true;
    }
    setProjectFlowError('');

    try {
      await updateProjectRecord('domain_set');
      projectFlowStep = 3;
      renderProjectFlowStep();
      pushActivity('Selected domain ' + projectFlowState.selectedDomain.name + '.');
    } catch (error) {
      var message = error && error.message ? error.message : 'Could not save domain selection.';
      setProjectFlowError(message);
    } finally {
      if (projectDomainArrow) {
        projectDomainArrow.disabled = false;
      }
    }
  };

  var renderPromptAssets = function () {
    if (!projectAssetsList) {
      return;
    }
    if (projectFlowState.promptAssets.length === 0) {
      projectAssetsList.innerHTML = '<li>No files added yet.</li>';
      return;
    }
    projectAssetsList.innerHTML = projectFlowState.promptAssets
      .map(function (asset) {
        var meta = asset.kind === 'image' ? 'Image' : 'Document';
        return (
          '<li>' +
          '<span>' +
          escapeHtml(asset.name) +
          ' (' +
          escapeHtml(meta) +
          ')</span>' +
          '<button type="button" class="project-assets-remove" data-remove-asset="' +
          escapeHtml(asset.id) +
          '" aria-label="Remove asset">×</button>' +
          '</li>'
        );
      })
      .join('');

    Array.from(projectAssetsList.querySelectorAll('[data-remove-asset]')).forEach(function (button) {
      button.addEventListener('click', function () {
        var id = button.getAttribute('data-remove-asset') || '';
        projectFlowState.promptAssets = projectFlowState.promptAssets.filter(function (asset) {
          return asset.id !== id;
        });
        renderPromptAssets();
      });
    });
  };

  var addPromptAssetsFromFiles = function (files) {
    if (!files || files.length === 0) {
      return;
    }
    Array.from(files).forEach(function (file, index) {
      var mimeType = file.type || '';
      var kind = mimeType.startsWith('image/') ? 'image' : 'document';
      projectFlowState.promptAssets.push({
        id: String(Date.now()) + '-' + String(Math.floor(Math.random() * 1000)) + '-' + String(index),
        name: file.name || 'asset',
        mimeType: mimeType,
        size: file.size || 0,
        kind: kind,
        file: file
      });
    });
    renderPromptAssets();
  };

  var collectPromptAssetsPayload = async function () {
    var images = [];
    var documents = [];
    for (var index = 0; index < projectFlowState.promptAssets.length; index += 1) {
      var asset = projectFlowState.promptAssets[index];
      if (!asset.file) {
        continue;
      }
      var dataUrl = await readFileAsDataUrl(asset.file);
      var item = {
        name: asset.name,
        mimeType: asset.mimeType,
        dataUrl: dataUrl
      };
      if (asset.kind === 'image') {
        images.push(item);
      } else {
        documents.push(item);
      }
    }
    return {
      images: images,
      documents: documents
    };
  };

  var appendPlanChatMessage = function (role, message) {
    if (!projectPlanChatLog || !message) {
      return;
    }
    var li = document.createElement('li');
    li.className = role === 'user' ? 'is-user' : 'is-assistant';
    li.textContent = message;
    projectPlanChatLog.appendChild(li);
    projectPlanChatLog.scrollTop = projectPlanChatLog.scrollHeight;
  };

  var getPlanSummaryFromResponse = function (payload) {
    if (!payload || typeof payload !== 'object') {
      return 'Plan generated.';
    }
    if (typeof payload.planSummary === 'string' && payload.planSummary.trim()) {
      return payload.planSummary.trim();
    }
    if (typeof payload.summary === 'string' && payload.summary.trim()) {
      return payload.summary.trim();
    }
    if (payload.plan && typeof payload.plan === 'string' && payload.plan.trim()) {
      return payload.plan.trim();
    }
    if (payload.plan && typeof payload.plan === 'object') {
      return getPlannerSummary(payload.plan);
    }
    if (payload.planner) {
      return getPlannerSummary(payload.planner);
    }
    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message.trim();
    }
    return getPlannerSummary(payload);
  };

  var generateProjectPlan = async function () {
    projectFlowState.prompt = websitePromptInput ? websitePromptInput.value.trim() : '';
    if (projectFlowState.prompt.length < 16) {
      setProjectFlowError('Add a more detailed prompt before generating the plan.');
      return;
    }
    if (!projectFlowState.projectId) {
      setProjectFlowError('Save your project name first.');
      projectFlowStep = 1;
      renderProjectFlowStep();
      return;
    }

    projectFlowStep = 4;
    projectFlowState.planReady = false;
    renderProjectFlowStep();
    setProjectFlowError('');
    if (projectPlanLoading) {
      projectPlanLoading.hidden = false;
      setInlineLoadingText(projectPlanLoading, 'Building plan');
    }

    if (projectPlanArrow) {
      projectPlanArrow.disabled = true;
    }

    try {
      var assets = await collectPromptAssetsPayload();
      var docNames = assets.documents.map(function (entry) {
        return entry.name;
      });
      var fullRequest =
        projectFlowState.prompt +
        (docNames.length > 0 ? '\n\nReference documents: ' + docNames.slice(0, 8).join(', ') : '');
      var payload = {
        projectId: projectFlowState.projectId,
        userRequest: fullRequest,
        images: assets.images
      };

      var response = await tryApiCandidates([
        {
          path: '/ai/projects/plan',
          method: 'POST',
          body: payload
        }
      ]);

      projectFlowState.planSummary = getPlanSummaryFromResponse(response);
      projectFlowState.planReady = true;
      projectFlowState.chatHistory = [
        {
          role: 'assistant',
          content: projectFlowState.planSummary
        }
      ];

      if (projectPlanSummaryText) {
        projectPlanSummaryText.textContent = projectFlowState.planSummary;
      }
      if (projectPlanChatLog) {
        projectPlanChatLog.innerHTML = '';
      }
      appendPlanChatMessage('assistant', projectFlowState.planSummary);
      if (projectPlanLoading) {
        projectPlanLoading.hidden = true;
      }
      await updateProjectRecord('plan_generated');
      pushActivity('Plan generated for "' + projectFlowState.projectName + '".');
    } catch (error) {
      if (projectPlanLoading) {
        projectPlanLoading.hidden = true;
      }
      var message = error && error.message ? error.message : 'Plan generation failed.';
      setProjectFlowError(message);
      projectFlowState.planReady = false;
      projectFlowStep = 3;
    } finally {
      if (projectPlanArrow) {
        projectPlanArrow.disabled = false;
      }
      renderProjectFlowStep();
    }
  };

  var sendPlanChatMessage = async function () {
    var message = projectPlanChatInput ? projectPlanChatInput.value.trim() : '';
    if (!message) {
      return;
    }

    appendPlanChatMessage('user', message);
    projectFlowState.chatHistory.push({ role: 'user', content: message });
    if (projectPlanChatInput) {
      projectPlanChatInput.value = '';
    }

    if (projectPlanChatSend) {
      projectPlanChatSend.disabled = true;
    }
    if (projectPlanLoading) {
      projectPlanLoading.hidden = false;
      setInlineLoadingText(projectPlanLoading, 'Refining plan');
    }
    var assistantReply = '';
    try {
      var planRequest =
        (projectFlowState.prompt || '') +
        '\n\nCurrent approved plan:\n' +
        (projectFlowState.planSummary || '') +
        '\n\nRefinement request:\n' +
        message;

      var response = await apiRequest('/ai/projects/plan', {
        method: 'POST',
        body: {
          projectId: projectFlowState.projectId,
          userRequest: planRequest
        }
      });
      assistantReply = getPlanSummaryFromResponse(response) || 'Plan updated. Continue refining or start the build.';
    } catch (error) {
      assistantReply = 'Plan updated. Continue refining or start the build.';
    } finally {
      if (projectPlanLoading) {
        projectPlanLoading.hidden = true;
      }
      if (projectPlanChatSend) {
        projectPlanChatSend.disabled = false;
      }
    }

    projectFlowState.planSummary = assistantReply;
    projectFlowState.chatHistory.push({ role: 'assistant', content: assistantReply });
    if (projectPlanSummaryText) {
      projectPlanSummaryText.textContent = assistantReply;
    }
    appendPlanChatMessage('assistant', assistantReply);
    try {
      await updateProjectRecord('plan_refined');
    } catch (error) {
    }
  };

  // payment helpers
  var updatePaymentSummary = function () {
    if (paymentProjectName) paymentProjectName.textContent = projectFlowState.projectName || '';
    if (paymentDomain) paymentDomain.textContent = projectFlowState.selectedDomain ? projectFlowState.selectedDomain.name : '';
    if (paymentDomainCost) {
      var cost = 0;
      if (projectFlowState.selectedDomain && typeof projectFlowState.selectedDomain.price === 'number') {
        cost = projectFlowState.selectedDomain.price;
      }
      paymentDomainCost.textContent = cost ? formatCurrency(cost) : '';
    }
    if (paymentTotal) {
      var total = 0;
      if (projectFlowState.selectedDomain && typeof projectFlowState.selectedDomain.price === 'number') {
        total += projectFlowState.selectedDomain.price;
      }
      paymentTotal.textContent = formatCurrency(total);
    }
  };

  var goToPaymentStep = function () {
    if (projectBuildArrow) {
      projectBuildArrow.disabled = true;
    }
    projectFlowStep = 5;
    updatePaymentSummary();
    renderProjectFlowStep();
  };

  var delay = function (durationMs) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, durationMs);
    });
  };

  var markBuildTaskComplete = function (taskKey) {
    var item = buildTaskItems.find(function (entry) {
      return entry.getAttribute('data-build-task') === taskKey;
    });
    if (item) {
      item.classList.add('is-complete');
    }
  };

  var resetBuildTasks = function () {
    buildTaskItems.forEach(function (item) {
      item.classList.remove('is-complete');
    });
  };

  var startProjectBuild = async function () {
    // we've already paid if we reach here
    projectFlowStep = 6; // build step moved due to payment
    projectFlowState.buildCompleted = false;
    resetBuildTasks();
    renderProjectFlowStep();
    if (projectBuildArrow) {
      projectBuildArrow.disabled = true;
    }
    if (buildPreviewArrow) {
      buildPreviewArrow.disabled = true;
    }
    if (buildProgressLabel) {
      setInlineLoadingText(buildProgressLabel, 'Building backend');
    }

    try {
      var buildRequest =
        (projectFlowState.prompt || '') +
        '\n\nApproved build plan:\n' +
        (projectFlowState.planSummary || '') +
        '\n\nGenerate backend and frontend based on this approved plan.';
      await apiRequest('/ai/projects/build', {
        method: 'POST',
        body: {
          projectId: projectFlowState.projectId,
          userRequest: buildRequest
        }
      });
    } catch (error) {
      setProjectFlowError(error && error.message ? error.message : 'Build request failed.');
      if (buildProgressLabel) {
        setInlineLoadingText(buildProgressLabel, 'Build request failed');
      }
      return;
    }

    await delay(700);
    markBuildTaskComplete('backend');
    if (buildProgressLabel) {
      setInlineLoadingText(buildProgressLabel, 'Building frontend');
    }
    await delay(700);
    markBuildTaskComplete('frontend');
    if (buildProgressLabel) {
      setInlineLoadingText(buildProgressLabel, 'Running checks');
    }
    await delay(700);
    markBuildTaskComplete('testing');
    if (buildProgressLabel) {
      setInlineLoadingText(buildProgressLabel, 'Preparing preview');
    }
    await delay(700);
    markBuildTaskComplete('preview');

    projectFlowState.buildCompleted = true;
    if (buildPreviewArrow) {
      buildPreviewArrow.disabled = false;
    }
    if (buildProgressLabel) {
      setInlineLoadingText(buildProgressLabel, 'Build complete');
    }
    try {
      await updateProjectRecord('build_complete');
    } catch (error) {
    }
    pushActivity('Build completed for "' + projectFlowState.projectName + '".');
  };

  var derivePreviewUrl = function () {
    if (projectFlowState.previewUrl) {
      return projectFlowState.previewUrl;
    }
    if (projectFlowState.selectedDomain && projectFlowState.selectedDomain.name) {
      return 'https://' + projectFlowState.selectedDomain.name;
    }
    return 'https://hyprbuild.app';
  };

  var openProjectPreview = function () {
    var previewUrl = derivePreviewUrl();
    projectFlowState.previewUrl = previewUrl;
    if (projectPreviewFrame) {
      projectPreviewFrame.src = previewUrl;
    }
    if (projectPreviewWrap) {
      projectPreviewWrap.hidden = false;
    }
    setProjectFlowError('');
  };

  var publishProject = async function () {
    if (!projectFlowState.projectId) {
      setProjectFlowError('Project ID is missing.');
      return;
    }
    if (projectPublishButton) {
      projectPublishButton.disabled = true;
    }
    if (publishContinueArrow) {
      publishContinueArrow.disabled = true;
    }
    if (projectPublishStatus) {
      projectPublishStatus.textContent = 'Publishing...';
    }

    try {
      await apiRequest('/projects/' + encodeURIComponent(projectFlowState.projectId) + '/publish', {
        method: 'POST'
      });
      projectFlowState.publishCompleted = true;
      if (projectPublishStatus) {
        projectPublishStatus.textContent = 'Project published. You can preview again or close and save.';
      }
      await updateProjectRecord('published');
      pushActivity('Project "' + projectFlowState.projectName + '" published.');
    } catch (error) {
      var message = error && error.message ? error.message : 'Publishing failed.';
      if (projectPublishStatus) {
        projectPublishStatus.textContent = message;
      }
      setProjectFlowError(message);
    } finally {
      if (projectPublishButton) {
        projectPublishButton.disabled = false;
      }
      if (publishContinueArrow) {
        publishContinueArrow.disabled = false;
      }
    }
  };

  var closeAndSaveProject = async function () {
    try {
      await updateProjectRecord('saved');
    } catch (error) {
    }
    setCurrentView('overview', true);
    pushActivity('Saved and closed "' + (projectFlowState.projectName || 'project') + '".');
  };

  var renderProjectFlowStep = function () {
    var totalSteps = projectStepPanes.length || 7;
    if (projectFlowStep < 1) {
      projectFlowStep = 1;
    }
    if (projectFlowStep > totalSteps) {
      projectFlowStep = totalSteps;
    }

    if (projectFlowIntro) {
      var stepIntroByNumber = {
        1: 'For this first step, make a name for your project.',
        2: 'Choose your domain for this project.',
        3: 'Describe what you want to build and add images or docs.',
        4: 'Review and refine the build plan with AI.',
        5: 'Review payment before starting your build.',
        6: 'Hyprbuild is building your backend and frontend.',
        7: 'Preview your site and publish when ready.'
      };
      projectFlowIntro.textContent = stepIntroByNumber[projectFlowStep] || 'Continue your project setup.';
    }

    projectStepPanes.forEach(function (pane, index) {
      pane.hidden = index + 1 !== projectFlowStep;
    });

    projectFlowSteps.forEach(function (item) {
      var itemStep = Number(item.getAttribute('data-step') || 0);
      item.classList.toggle('is-active', itemStep === projectFlowStep);
    });

    if (projectPlanSummary) {
      projectPlanSummary.hidden = !projectFlowState.planReady;
    }
    if (projectPlanChat) {
      projectPlanChat.hidden = !projectFlowState.planReady;
    }
    if (projectBuildArrow) {
      projectBuildArrow.disabled = !projectFlowState.planReady;
      projectBuildArrow.setAttribute('aria-label', projectFlowState.paid ? 'Start building project' : 'Pay & Build');
    }
    if (buildPreviewArrow) {
      buildPreviewArrow.disabled = !projectFlowState.buildCompleted;
    }
    var isFirstStep = projectFlowStep <= 1;
    var isLastStep = projectFlowStep >= totalSteps;
    if (projectCyclePrev) {
      var hidePrev = totalSteps < 2 || isFirstStep;
      projectCyclePrev.disabled = hidePrev;
      projectCyclePrev.style.visibility = hidePrev ? 'hidden' : 'visible';
      projectCyclePrev.setAttribute('aria-hidden', hidePrev ? 'true' : 'false');
    }
    if (projectCycleNext) {
      var hideNext = totalSteps < 2 || isLastStep;
      projectCycleNext.disabled = hideNext;
      projectCycleNext.style.visibility = hideNext ? 'hidden' : 'visible';
      projectCycleNext.setAttribute('aria-hidden', hideNext ? 'true' : 'false');
    }

    // update URL hash so each step looks like its own page
    if (currentView === 'new-project') {
      window.history.replaceState(null, '', '#new-project/step' + projectFlowStep);
    }
  };

  var resetProjectFlow = function () {
    projectFlowStep = 1;
    projectFlowState = {
      projectId: '',
      projectName: '',
      nameSaved: false,
      domainRoot: '',
      selectedDomain: null,
      promptAssets: [],
      prompt: '',
      planSummary: '',
      planReady: false,
      chatHistory: [],
      paid: false,
      buildCompleted: false,
      previewUrl: '',
      publishCompleted: false
    };

    setProjectFlowError('');
    setProjectNameStatus('', false);
    if (projectNameInput) {
      projectNameInput.value = '';
      projectNameInput.hidden = true;
    }
    if (projectNameDisplay) {
      projectNameDisplay.hidden = false;
    }
    if (projectNameSetButton) {
      projectNameSetButton.hidden = false;
      projectNameSetButton.disabled = false;
    }
    if (domainRootInput) {
      domainRootInput.value = '';
    }
    if (domainResults) {
      domainResults.innerHTML = '';
    }
    setDomainSelectedLine();
    if (websitePromptInput) {
      websitePromptInput.value = '';
    }
    if (projectAssetInput) {
      projectAssetInput.value = '';
    }
    renderPromptAssets();
    if (projectPlanSummaryText) {
      projectPlanSummaryText.textContent = 'Waiting for plan output.';
    }
    if (projectPlanSummary) {
      projectPlanSummary.hidden = true;
    }
    if (projectPlanLoading) {
      projectPlanLoading.hidden = true;
      setInlineLoadingText(projectPlanLoading, 'Building plan');
    }
    if (projectPlanChat) {
      projectPlanChat.hidden = true;
    }
    if (projectPlanChatLog) {
      projectPlanChatLog.innerHTML = '<li class="is-assistant">Plan chat is ready.</li>';
    }
    if (projectPlanChatInput) {
      projectPlanChatInput.value = '';
    }
    resetBuildTasks();
    if (buildProgressLabel) {
      setInlineLoadingText(buildProgressLabel, 'Preparing build pipeline');
    }
    if (buildPreviewArrow) {
      buildPreviewArrow.disabled = true;
    }
    if (projectPreviewWrap) {
      projectPreviewWrap.hidden = true;
    }
    if (projectPreviewFrame) {
      projectPreviewFrame.src = '';
    }
    if (projectPublishStatus) {
      projectPublishStatus.textContent = '';
    }

    syncProjectNameDisplay();
    renderProjectFlowStep();
  };

  var cycleProjectFlowStep = async function (direction) {
    var totalSteps = projectStepPanes.length || 7;
    if (totalSteps < 2) {
      return;
    }
    var targetStep = projectFlowStep;
    if (direction > 0) {
      if (projectFlowStep >= totalSteps) {
        return;
      }
      targetStep = projectFlowStep + 1;
    } else {
      if (projectFlowStep <= 1) {
        return;
      }
      targetStep = projectFlowStep - 1;
    }
    await navigateProjectFlowToStep(targetStep);
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
      if (projectNameDisplay) {
        projectNameDisplay.focus();
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
        projectFlowState.domainRoot = root;
        if (projectFlowState.selectedDomain && !projectFlowState.selectedDomain.name.startsWith(root + '.')) {
          projectFlowState.selectedDomain = null;
          setDomainSelectedLine();
        }
      });
      domainRootInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          if (domainCheckButton) {
            domainCheckButton.click();
          }
        }
      });
    }

    if (presetDomainButtons.length > 0) {
      presetDomainButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          var fqdn = button.getAttribute('data-domain-preset') || '';
          var price = parseOptionalNumber(priceFromName(fqdn));
          projectFlowState.selectedDomain = {
            name: fqdn,
            price: price === null ? 0 : price
          };
          projectFlowState.domainRoot = cleanDomainRoot(fqdn);
          if (domainRootInput) {
            domainRootInput.value = projectFlowState.domainRoot;
          }
          setDomainSelectedLine();
          setProjectFlowError('');
        });
      });
    }

    if (projectNameDisplay) {
      projectNameDisplay.addEventListener('click', function () {
        beginProjectNameEdit();
      });
    }

    if (projectFlowSteps.length > 0) {
      projectFlowSteps.forEach(function (stepItem) {
        stepItem.setAttribute('role', 'button');
        stepItem.setAttribute('tabindex', '0');
        stepItem.addEventListener('click', function () {
          var targetStep = Number(stepItem.getAttribute('data-step') || 0);
          void navigateProjectFlowToStep(targetStep);
        });
        stepItem.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            var targetStep = Number(stepItem.getAttribute('data-step') || 0);
            void navigateProjectFlowToStep(targetStep);
          }
        });
      });
    }

    if (projectCyclePrev) {
      projectCyclePrev.addEventListener('click', function () {
        void cycleProjectFlowStep(-1);
      });
    }

    if (projectCycleNext) {
      projectCycleNext.addEventListener('click', function () {
        void cycleProjectFlowStep(1);
      });
    }

    if (projectNameInput) {
      projectNameInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          void saveProjectNameAndContinue();
          return;
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          finishProjectNameEdit(true);
        }
      });
      projectNameInput.addEventListener('blur', function () {
        finishProjectNameEdit(true);
      });
    }

    if (projectNameSetButton) {
      projectNameSetButton.addEventListener('click', function () {
        void persistProjectName();
      });
    }

    if (projectDomainArrow) {
      projectDomainArrow.addEventListener('click', function () {
        void saveDomainAndContinue();
      });
    }

    if (projectAssetAddButton && projectAssetInput) {
      projectAssetAddButton.addEventListener('click', function () {
        projectAssetInput.click();
      });
    }

    if (projectAssetInput) {
      projectAssetInput.addEventListener('change', function () {
        addPromptAssetsFromFiles(projectAssetInput.files || []);
        projectAssetInput.value = '';
      });
    }

    if (websitePromptInput) {
      websitePromptInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          void generateProjectPlan();
        }
      });
    }

    if (projectPlanArrow) {
      projectPlanArrow.addEventListener('click', function () {
        void generateProjectPlan();
      });
    }

    if (projectPlanChatSend) {
      projectPlanChatSend.addEventListener('click', function () {
        void sendPlanChatMessage();
      });
    }

    if (projectPlanChatInput) {
      projectPlanChatInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          void sendPlanChatMessage();
        }
      });
    }

    if (projectBuildArrow) {
      projectBuildArrow.addEventListener('click', function () {
        if (!projectFlowState.paid) {
          goToPaymentStep();
        } else {
          void startProjectBuild();
        }
      });
    }

    if (paymentButton) {
      paymentButton.addEventListener('click', async function () {
        // in a real app this would hit the backend/Stripe
        if (!projectFlowState.projectId) {
          setProjectFlowError('Unable to process payment, project not saved.');
          return;
        }
        setProjectFlowError('');
        paymentButton.disabled = true;
        try {
          // example stub - you could call /projects/:id/checkout
          projectFlowState.paid = true;
          await updateProjectRecord('paid');
          // once paid, start building immediately
          await startProjectBuild();
        } catch (err) {
          setProjectFlowError('Payment error. ' + (err.message || ''));          
        } finally {
          paymentButton.disabled = false;
        }
      });
    }

    if (buildPreviewArrow) {
      buildPreviewArrow.addEventListener('click', function () {
        projectFlowStep = 7; // publish
        renderProjectFlowStep();
      });
    }

    if (projectPreviewButton) {
      projectPreviewButton.addEventListener('click', function () {
        openProjectPreview();
      });
    }

    if (projectPublishButton) {
      projectPublishButton.addEventListener('click', function () {
        void publishProject();
      });
    }

    if (publishContinueArrow) {
      publishContinueArrow.addEventListener('click', function () {
        if (projectFlowState.publishCompleted) {
          openProjectPreview();
          return;
        }
        void publishProject();
      });
    }

    if (projectCloseSaveButton) {
      projectCloseSaveButton.addEventListener('click', function () {
        void closeAndSaveProject();
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
    console.log('Boot starting...');
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

      console.log('User loaded:', meUser);

      if (!meUser || !meUser.id) {
        throw new Error('No user payload returned from /api/me');
      }

      currentUser = meUser;
      syncProfileFields(meUser);
      syncProjectNameDisplay();

      // Check user verification
      var isUserVerified = checkUserVerification(meUser);
      console.log('User verified:', isUserVerified);
      if (!isUserVerified) {
        console.log('Calling applyAccessRestrictions');
        applyAccessRestrictions();
        setStatus('', 'success');
        return;
      }

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
      console.error('Boot error:', error);
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

  console.log('About to call boot()');
  boot();
})();
