export const testPages: Record<string, string> = {
  "/Dexter_(TV_series)":
    "<html>\n  <head>\n    <title>Dexter (TV series) - Wikipedia</title>\n  </head>\n  <body></body>\n</html>\n",
  "/Dr._Stone":
    '<html>\n  <head> </head>\n  <body>\n    <p>Is there</p>\n    <div id="inline-test">\n      <p>Direct child</p>\n      <p>Other</p>\n    </div>\n    <div id="mw-content-text">\n      <div class="mw-content-ltr mw-parser-output">\n        <table>\n          fake\n        </table>\n        <table>\n          bait\n        </table>\n        <table>\n          testttt\n          <dt>fake data</dt>\n        </table>\n        <table>\n          <tbody>\n            <tr>\n              <th>Début</th>\n              <th>Fin</th>\n            </tr>\n            <tr>\n              fake\n            </tr>\n            <tr>\n              <td>wrong data</td>\n            </tr>\n          </tbody>\n        </table>\n      </div>\n    </div>\n  </body>\n</html>\n',
  "/Fumiya_Tomozaki":
    '<html>\n  <head> </head>\n  <body>\n    <p></p>\n    <div>\n      <div>\n        <span></span>\n      </div>\n    </div>\n    <div>\n      <span>\n        <a title="Atafami" href="/wiki/Atafami">Attack Families</a>\n      </span>\n    </div>\n    <div class="zip">\n      Main div\n      <p>Test1</p>\n      <p>Test2</p>\n      <p>Test3</p>\n    </div>\n    <div id="multiple-zip">\n      <h2>Title1</h2>\n      <p>Text1</p>\n      <h2>Title2</h2>\n      <p>Text2</p>\n      <h2>Title3</h2>\n    </div>\n  </body>\n</html>\n',
  "/I_Made_Friends_with_the_Second_Prettiest_Girl_in_My_Class":
    "<html>\n  <head>\n    <title>\n      I Made Friends with the Second Prettiest Girl in My Class - Wikipedia\n    </title>\n  </head>\n  <body>\n    <table>\n      <dl>\n        <dt></dt>\n      </dl>\n    </table>\n    <table>\n      <dl>\n        <dt>Bait</dt>\n        <dt>Umi Asanagi</dt>\n      </dl>\n    </table>\n  </body>\n</html>\n",
  "/Mr._Robot":
    '<html>\n  <head>\n    <title>Mr. Robot | Mr. Robot Wiki | Fandom</title>\n  </head>\n  <body>\n    <h1 class="mw-page-title-main">Mr. Robot</h1>\n  </body>\n</html>\n',
  "/The_Pet_Girl_of_Sakurasou":
    '<html>\n  <head>\n    <title>The Pet Girl of Sakurasou - Wikipedia</title>\n  </head>\n  <body>\n    <table>\n      <dl></dl>\n      <dl></dl>\n      <dl></dl>\n      <dl></dl>\n      <dl></dl>\n      <dl>\n        <dt>Ryūnosuke Akasaka</dt>\n        <dt>\n          <span>Fake</span>\n          <span lang="ja">赤坂 龍之介</span>\n        </dt>\n      </dl>\n    </table>\n  </body>\n</html>\n',
};
