export const Messages = {
  errors: {
    error: 'Error',
    loginErr: 'We’re unable to find an account that matches that email address. Please try again.',
    registerErr: 'Failed to login.',
    sessionExpired: 'Session expired! Please login in to continue',
    badRequest: 'Bad request. Please try again.',
    serverErr: 'Something went wrong. Please try again.',
    validationErr: 'Please fill all required fields.',
    invalidLink: 'This link is no longer valid. Redirecting to login.',
    invalidToken: 'This link is no longer valid.',
    permissionErr : 'You do not have permission to perform this action.',
    uploadFailed: 'Failed to upload document',
    attachFailed: 'Failed to attach document',
    noTaskFound: 'Task not found.',
    noProjectFound: 'Project not found.',
    assignTask: 'Please Assign this task to a team member or group in order to create it!',
    assignWorkflow: 'Please Assign this workflow to a team member or group in order to create it!',
    assignOwner: 'Please Assign a team member or group in order to create it!',
    validReceipientEmail: 'Please enter valid receipient email',
    validCCEmail: 'Please enter valid cc email',
    requiredNameAndEmail: 'Receipient name and email are required fields',
    inputMessage: 'Please input a message to send',
    taskNameLength: 'Task name should not be more than 254 characters!',
    taskNameRequired: 'Please fill all task name field.',
    projectNameRequired: 'Please fill project name field.',
    projectNameLength: 'Project name should not be more than 254 characters!',
    workFlowNameLength: 'Workflow name should not be more than 254 characters!',
    workFlowNameRequired: 'Please fill all workflow name field.',
    noTagFound: 'Tag not found.',
    noRequestFound: 'Service request not found',
    copyDocErr: 'Please select project, workflow or task to copy document',
    noDocToUpload: 'No file selected to upload',
    failedToAddGroup: 'Sorry! But a group with the name already exist. Please try again.',
    taskTemplateNameLength: 'Task template name should not be more than 40 characters!'
  },
  success: {
    success: 'Success',
    logout: 'Logged out successfully!',
    auth: {
      forgotPwdMsg: 'Password recovery email has been sent. Please check your inbox or spam folder.'
    },
    task: {
      notification: 'Ping sent successfully',
      taskUpdated: 'Task was successfully updated!',
      renamed: 'Task renamed successfully!',
    },
    documentDel: 'Document deleted successfully!',
    taskDelete: 'Task deleted successfully!',
    taskCreated: 'Task created successfully!',
    workflowCreated: 'Workflow created successfully!',
    projectCreated: 'Project created successfully!',
    filesAttachedMsg: 'Files successfully attached with message',
    filesAttached: 'Files successfully uploaded and attached',
    linkedToRequest: ' linked to request successfully!',
    reqConvert: 'The Requests were successfully converted into tasks.',
    groupCreated: 'Your Group created successfully.'
  },
  notifier: {
    settingsUpdated: 'Settings updated successfully.',
    pwdChanged: 'Password changed successfully.',
    pwdChangedFailed: 'Error occured while change password.',
    docUpload: 'Document uploaded successfully.',
    docDelete: 'Your document was successfully deleted.',
    docTags: 'Tag was updated successfully.',
    fileUpload: 'File uploaded successfully!',
    downloadComplete: 'Completed file download!',
    docRemove: 'Document removed successfully!.',
    readAllNotifications:  'Notifications Successfully Read by the User.',
    notificationRemoved: 'Notification removed successfully!',
    emailSent: 'Email sent successfully.',
    reqRemove: 'Request removed successfully.',
    tagRemove: 'Tag removed successfully.',
    tagCreated: 'Tag created successfully!',
    userRemoved: 'User has been removed!',
    groupRemoved: 'Group removed successfully!',
    errorGroupRemoved: 'Error occured while removing group!',
    docAllowExtension: 'Please upload file of specified format: .docx, .doc, .rtf, .txt, .docm, .xml, .xlsx, .xls, .pdf, .png, .tif & .csv',
    selectDocToUpload: 'Please select file to upload.',
    errorRemoveFile: 'Error occured while removing document.',
    selectPWT: 'Please select project. workflow or task to upload document.',
    errorUploadFile: 'Error while uploading file',
    fileNotSupported: 'File format not supported!',
    enterSubject: 'Please enter subject!',
    enterDescription: 'Please enter description!',
    enterCaptcha: 'Please select captcha!',
    nameReq: 'Name is required!',
    nameNotMoreThan50: 'Name cannot be more than 50 characters long!',
    emailReq: 'Email is required!',
    validEmail: 'Email must be a valid email address!',
    phoneMust10: 'Phone number must contain 10 digits!',
    reportMgmt: {
      productivityNotFound: 'Record not found for productivity report',
      efficiencyNotFound: 'Record not found for efficiency report',
      workloadNotFound: 'Record not found for workload report',
      groupWorkloadNotFound: 'Record not found for group workload report',
      privilegeNotFound: 'Record not found for privilege report',
      tagNotFound: 'Record not found for tag report',
      filterTag: 'Please filter tag from list.'
    },
    nameTagFirst: 'Please enter a name for the tag in order to continue.',
    validTagName:  'The tag format is not valid, please try again using only: letters, numbers, hyphens and underscores.',
    inputTagName: 'Please Input Tag Name!',
    selectPermissions: 'Please select the user permissions!',
    emailExists: 'Email(s) already exist',
    selectGroup: 'Please select group',
    lastNameReq: 'Last name is required',
    firstNameReq: 'First name is required',
    notValidEmail: ' is not valid email address',
    dropTask: 'You cannot place this task here as its a starred task.',
    dropStarredTask: 'You cannot place starred task here as its a unstarred task.',
    notificationUpdated: 'Notification Updated Successfully!',
    newPermission: 'User Role is added with new permissions!',
    updatedRole: 'User Role is updated with new permissions!',
    groupNameRequired: 'Please input group name!'
  },
  popups: {
    deletedMsg: {
      title: 'Delete Message',
      message: 'Once you have deleted this message, this action cannot be reversed.'
    },
    deleteDoc: {
      title: 'Delete Document',
      message: 'Once you have deleted this document, this action cannot be reversed.'
    }
  }
};
