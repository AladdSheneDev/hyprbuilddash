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
  var settingsCurrentPasswordInput = document.getElementById('settings-current-password');
  var settingsNewPasswordInput = document.getElementById('settings-new-password');
  var settingsConfirmPasswordInput = document.getElementById('settings-confirm-password');
  var settingsAvatarPreview = document.getElementById('settings-avatar-preview');
  var settingsFeedback = document.getElementById('settings-feedback');

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
    return route === 'settings' ? 'settings' : 'overview';
  };

  var setCurrentView = function (route, syncHash) {
    var nextView = route === 'settings' ? 'settings' : 'overview';
    currentView = nextView;

    var showOverview = nextView === 'overview';
    var showSettings = nextView === 'settings';

    if (viewOverview) {
      viewOverview.hidden = !showOverview;
      viewOverview.style.display = showOverview ? '' : 'none';
    }
    if (viewSettings) {
      viewSettings.hidden = !showSettings;
      viewSettings.style.display = showSettings ? 'grid' : 'none';
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
      pageTitle.textContent = nextView === 'settings' ? 'Settings' : 'Overview';
    }
    if (pageKicker) {
      pageKicker.textContent = 'Dashboard';
    }
    if (profileButton) {
      profileButton.setAttribute('aria-expanded', nextView === 'settings' ? 'true' : 'false');
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
      window.location.href = 'https://hyprbuild.app';
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
