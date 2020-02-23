export default {
  studyStatusUpdate: {
    studyAcceptedTitle: 'Confirmation of acceptance of study { studyTitle }',
    studyAcceptedThanks: 'Thank you for accepting to take part in the study { studyTitle }.',
    studyAcceptedConsentedTasks: 'You have consented to the following:',
    studyAcceptedNotConsentedTasks: 'You have not consented to the following:',
    studyCompletedTitle: 'Completion of study { studyTitle }',
    studyCompletedThanks: 'The study { studyTitle } has now been completed. Thank you for your participation.',
    studyWithdrawnTitle: 'Withdrawal from study { studyTitle }',
    studyWithdrawnThanks: 'You have withdrawn from the study { studyTitle }. Thank you for your time.'
  },
  account: {
    passwordRecoveryTitle: 'Mobistudy password recovery',
    passwordRecoveryContent: `<p>You have requested to reset your password on Mobistudy.</p>
    <p>Please go to <a href={serverlink}>this webpage</a> to set another password.</p>
    <p>Or use the following code if required: {token}</p>
    <p>This code will expire after 24 hours.</p>`
  }
}
