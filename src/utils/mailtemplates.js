const happyBirthdayActive = {
  subject: 'Herzlichen Glückwunsch zum Geburtstag',
  text: `Hallo <%= name %>,

  im Namen des gesamten Vorstands gratulieren wir sehr herzlich zu deinem <%= age %>. Geburtstag und wünschen viel Freude, Erfolg und Gesundheit für das neue Lebensjahr.

  Es ist toll, dass du dich für Gaming einsetzt und als aktives Mitglied einen wichtigen Beitrag zu unserer Gemeinschaft leistest.
  Wir danken dir, dass du den Verein und die Ziele von Elysium Gaming Tübingen e.V. unterstützt.

  Mitgliedsnummer: <%= membershipNumber %>
  Beitrittsdatum: <%= joinDate %>

  Viele Grüße,

  Der Gesamtvorstand
  Elysium Gaming Tübingen e.V.`,
  html: `Hallo <%= name %>,<br />

  <p>im Namen des gesamten Vorstands gratulieren wir sehr herzlich zu deinem <strong><%= age %>. Geburtstag</strong> und wünschen viel Freude, Erfolg und Gesundheit für das neue Lebensjahr.</p>
  
  <p>Es ist toll, dass du dich für Gaming einsetzt und als aktives Mitglied einen wichtigen Beitrag zu unserer Gemeinschaft leistest.<br />Wir danken dir, dass du den Verein und die Ziele von <strong>Elysium Gaming Tübingen e.V.</strong> unterstützt.</p>

  <p>
    Mitgliedsnummer: <%= membershipNumber %><br />
    Beitrittsdatum: <%= joinDate %>
  </p>

  <p>Viele Grüße,<br /><br />
  <strong>Der Gesamtvorstand</strong><br />
  Elysium Gaming Tübingen e.V.</p>
  `,
};

const happyBirthdayPassive = {
  subject: 'Herzlichen Glückwunsch zum Geburtstag',
  text: `Hallo <%= name %>,

  im Namen des gesamten Vorstands gratulieren wir sehr herzlich zu deinem <%= age %>. Geburtstag und wünschen viel Freude, Erfolg und Gesundheit für das neue Lebensjahr.

  Als passives Mitglied teilst du unsere Ziele und trägst Elysium Gaming Tübingen e.V. in deinem Herzen.
  Dafür sind wir dankbar.

  Mitgliedsnummer: <%= membershipNumber %>
  Beitrittsdatum: <%= joinDate %>

  Viele Grüße,

  Der Gesamtvorstand
  Elysium Gaming Tübingen e.V.`,
  html: `Hallo <%= name %>,<br />

  <p>im Namen des gesamten Vorstands gratulieren wir sehr herzlich zu deinem <strong><%= age %>. Geburtstag</strong> und wünschen viel Freude, Erfolg und Gesundheit für das neue Lebensjahr.</p>
  
  <p>Als passives Mitglied teilst du unsere Ziele und trägst <strong>Elysium Gaming Tübingen e.V.</strong> in deinem Herzen.<br />Dafür sind wir dankbar.</p>

  <p>
    Mitgliedsnummer: <%= membershipNumber %><br />
    Beitrittsdatum: <%= joinDate %>
  </p>

  <p>Viele Grüße,<br /><br />
  <strong>Der Gesamtvorstand</strong><br />
  Elysium Gaming Tübingen e.V.</p>
  `,
};


module.exports = {
  happyBirthdayActive,
  happyBirthdayPassive,
};
