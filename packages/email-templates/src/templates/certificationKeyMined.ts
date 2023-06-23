import handlebars from 'handlebars'
import { customContentStyle } from './helpers/customContentStyle'
import { links } from './helpers/links'

handlebars.registerHelper('links', links)

export default {
  subject: `Your certification for {{{lockName}}}`,
  html: `<h1>Your NFT certification for "{{lockName}}" was sent to you!</h1>
<p>Congratulations! You can view and share your certificate for <strong>{{lockName}}</strong> on LinkedIn <a href="{{certificationUrl}}">Here</a>.</p>

{{#if customContent}}
<section style="${customContentStyle}">
{{{customContent}}}
  </section>
{{/if}}

<p>It has been added to your <a href="{{keychainUrl}}">Unlock Keychain</a>, where you can view it and its metadata.</p>

{{links txUrl openSeaUrl true}}
`,
}
