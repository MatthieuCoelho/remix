import path from "node:path";

import {
  createRoutePath,
  flatRoutesUniversal,
  getRouteSegments,
} from "../config/flat-routes";
import type { ConfigRoute } from "../config/routes";

let APP_DIR = path.join("test", "root", "app");

describe("flatRoutes", () => {
  describe("creates proper route paths", () => {
    let tests: [string, string | undefined][] = [
      ["routes/$", "/routes/*"],
      ["routes/sub/$", "/routes/sub/*"],
      ["routes.sub/$", "/routes/sub/*"],
      ["routes/$slug", "/routes/:slug"],
      ["routes/sub/$slug", "/routes/sub/:slug"],
      ["routes.sub/$slug", "/routes/sub/:slug"],
      ["$", "/*"],
      ["nested/$", "/nested/*"],
      ["flat.$", "/flat/*"],
      ["$slug", "/:slug"],
      ["nested/$slug", "/nested/:slug"],
      ["flat.$slug", "/flat/:slug"],
      ["flat.sub", "/flat/sub"],
      ["nested/_index", "/nested"],
      ["flat._index", "/flat"],
      ["_index", undefined],
      ["_layout/_index", undefined],
      ["_layout/test", "/test"],
      ["_layout.test", "/test"],
      ["_layout/$slug", "/:slug"],
      ["nested/_layout/$slug", "/nested/:slug"],
      ["$slug[.]json", "/:slug.json"],
      ["sub/[sitemap.xml]", "/sub/sitemap.xml"],
      ["posts/$slug/[image.jpg]", "/posts/:slug/image.jpg"],
      ["sub.[[]", "/sub/["],
      ["sub.]", "/sub/]"],
      ["sub.[[]]", "/sub/[]"],
      ["sub.[[]", "/sub/["],
      ["beef]", "/beef]"],
      ["[index]", "/index"],
      ["test/inde[x]", "/test/index"],
      ["[i]ndex/[[].[[]]", "/index/[/[]"],

      // Optional segment routes
      ["(routes)/$", "/routes?/*"],
      ["(routes)/(sub)/$", "/routes?/sub?/*"],
      ["(routes).(sub)/$", "/routes?/sub?/*"],
      ["(routes)/($slug)", "/routes?/:slug?"],
      ["(routes)/sub/($slug)", "/routes?/sub/:slug?"],
      ["(routes).sub/($slug)", "/routes?/sub/:slug?"],
      ["(nested)/$", "/nested?/*"],
      ["(flat).$", "/flat?/*"],
      ["($slug)", "/:slug?"],
      ["(nested)/($slug)", "/nested?/:slug?"],
      ["(flat).($slug)", "/flat?/:slug?"],
      ["flat.(sub)", "/flat/sub?"],
      ["_layout/(test)", "/test?"],
      ["_layout.(test)", "/test?"],
      ["_layout/($slug)", "/:slug?"],
      ["(nested)/_layout/($slug)", "/nested?/:slug?"],
      ["($slug[.]json)", "/:slug.json?"],
      ["(sub)/([sitemap.xml])", "/sub?/sitemap.xml?"],
      ["(sub)/[(sitemap.xml)]", "/sub?/(sitemap.xml)"],
      ["(posts)/($slug)/([image.jpg])", "/posts?/:slug?/image.jpg?"],
      [
        "($[$dollabills]).([.]lol)/(what)/([$]).($up)",
        "/:$dollabills?/.lol?/what?/$?/:up?",
      ],
      ["(sub).([[])", "/sub?/[?"],
      ["(sub).(])", "/sub?/]?"],
      ["(sub).([[]])", "/sub?/[]?"],
      ["(sub).([[])", "/sub?/[?"],
      ["(beef])", "/beef]?"],
      ["([index])", "/index?"],
      ["(test)/(inde[x])", "/test?/index?"],
      ["([i]ndex)/([[]).([[]])", "/index?/[?/[]?"],

      // Opting out of parent layout
      ["app_.projects/$id.roadmap", "/app/projects/:id/roadmap"],
      ["app.projects_/$id.roadmap", "/app/projects/:id/roadmap"],
      ["app_.projects_/$id.roadmap", "/app/projects/:id/roadmap"],
    ];

    for (let [input, expected] of tests) {
      it(`"${input}" -> "${expected}"`, () => {
        let routeSegments = getRouteSegments(input);
        expect(createRoutePath(routeSegments)).toBe(expected);
      });
    }

    let invalidRoutes = [
      "($[$dollabills]).([.]lol)[/](what)/([$]).$",
      "$[$dollabills].[.]lol[/]what/[$].$",
    ];

    for (let invalid of invalidRoutes) {
      expect(() => getRouteSegments(invalid)).toThrow(
        "Route segment cannot contain a slash"
      );
    }
  });

  describe("should return the correct route hierarchy", () => {
    let files: [string, ConfigRoute][] = [
      [
        "routes/_auth.tsx",
        {
          file: "routes/_auth.tsx",
          id: "routes/_auth",
          parentId: "root",
        },
      ],
      [
        "routes/_auth.forgot-password.tsx",
        {
          file: "routes/_auth.forgot-password.tsx",
          id: "routes/_auth.forgot-password",
          parentId: "routes/_auth",
          path: "forgot-password",
        },
      ],
      [
        "routes/_auth.login.tsx",
        {
          file: "routes/_auth.login.tsx",
          id: "routes/_auth.login",
          parentId: "routes/_auth",
          path: "login",
        },
      ],
      [
        "routes/_auth.reset-password.tsx",
        {
          file: "routes/_auth.reset-password.tsx",
          id: "routes/_auth.reset-password",
          parentId: "routes/_auth",
          path: "reset-password",
        },
      ],
      [
        "routes/_auth.signup.tsx",
        {
          file: "routes/_auth.signup.tsx",
          id: "routes/_auth.signup",
          parentId: "routes/_auth",
          path: "signup",
        },
      ],
      [
        "routes/_landing.tsx",
        {
          file: "routes/_landing.tsx",
          id: "routes/_landing",
          parentId: "root",
        },
      ],
      [
        "routes/_landing._index.tsx",
        {
          file: "routes/_landing._index.tsx",
          id: "routes/_landing._index",
          index: true,
          parentId: "routes/_landing",
        },
      ],
      [
        "routes/_landing.index.tsx",
        {
          file: "routes/_landing.index.tsx",
          id: "routes/_landing.index",
          parentId: "routes/_landing",
          path: "index",
        },
      ],
      [
        "routes/about.tsx",
        {
          file: "routes/about.tsx",
          id: "routes/about",
          parentId: "root",
          path: "about",
        },
      ],
      [
        "routes/about._index.tsx",
        {
          file: "routes/about._index.tsx",
          id: "routes/about._index",
          index: true,
          parentId: "routes/about",
        },
      ],
      [
        "routes/about.$.tsx",
        {
          file: "routes/about.$.tsx",
          id: "routes/about.$",
          parentId: "routes/about",
          path: "*",
        },
      ],
      [
        "routes/about.faq.tsx",
        {
          file: "routes/about.faq.tsx",
          id: "routes/about.faq",
          parentId: "routes/about",
          path: "faq",
        },
      ],
      [
        "routes/about.$splat.tsx",
        {
          file: "routes/about.$splat.tsx",
          id: "routes/about.$splat",
          parentId: "routes/about",
          path: ":splat",
        },
      ],
      [
        "routes/app.tsx",
        {
          file: "routes/app.tsx",
          id: "routes/app",
          parentId: "root",
          path: "app",
        },
      ],
      [
        "routes/app.calendar.$day.tsx",
        {
          file: "routes/app.calendar.$day.tsx",
          id: "routes/app.calendar.$day",
          parentId: "routes/app",
          path: "calendar/:day",
        },
      ],
      [
        "routes/app.calendar._index.tsx",
        {
          file: "routes/app.calendar._index.tsx",
          id: "routes/app.calendar._index",
          index: true,
          parentId: "routes/app",
          path: "calendar",
        },
      ],
      [
        "routes/app.projects.tsx",
        {
          file: "routes/app.projects.tsx",
          id: "routes/app.projects",
          parentId: "routes/app",
          path: "projects",
        },
      ],
      [
        "routes/app.projects.$id.tsx",
        {
          file: "routes/app.projects.$id.tsx",
          id: "routes/app.projects.$id",
          parentId: "routes/app.projects",
          path: ":id",
        },
      ],

      // Opt out of parent layout
      [
        "routes/app_.projects.$id.roadmap[.pdf].tsx",
        {
          file: "routes/app_.projects.$id.roadmap[.pdf].tsx",
          id: "routes/app_.projects.$id.roadmap[.pdf]",
          parentId: "root",
          path: "app/projects/:id/roadmap.pdf",
        },
      ],
      [
        "routes/app_.projects/$id.roadmap.tsx",
        {
          file: "routes/app_.projects/$id.roadmap.tsx",
          id: "routes/app_.projects/$id.roadmap",
          parentId: "root",
          path: "app/projects/:id/roadmap",
        },
      ],

      [
        "routes/app.skip.tsx",
        {
          file: "routes/app.skip.tsx",
          id: "routes/app.skip",
          parentId: "routes/app",
          path: "skip",
        },
      ],
      [
        "routes/app.skip_/layout.tsx",
        {
          file: "routes/app.skip_/layout.tsx",
          id: "routes/app.skip_/layout",
          index: undefined,
          parentId: "routes/app",
          path: "skip/layout",
        },
      ],

      [
        "routes/app.skipall.tsx",
        {
          file: "routes/app.skipall.tsx",
          id: "routes/app.skipall",
          parentId: "routes/app",
          path: "skipall",
        },
      ],
      [
        "routes/app_.skipall_/_index.tsx",
        {
          file: "routes/app_.skipall_/_index.tsx",
          id: "routes/app_.skipall_/_index",
          index: true,
          parentId: "root",
          path: "app/skipall",
        },
      ],

      // Escaping route segments
      [
        "routes/about.[$splat].tsx",
        {
          file: "routes/about.[$splat].tsx",
          id: "routes/about.[$splat]",
          parentId: "routes/about",
          path: "$splat",
        },
      ],
      [
        "routes/about.[[].tsx",
        {
          file: "routes/about.[[].tsx",
          id: "routes/about.[[]",
          parentId: "routes/about",
          path: "[",
        },
      ],
      [
        "routes/about.[]].tsx",
        {
          file: "routes/about.[]].tsx",
          id: "routes/about.[]]",
          parentId: "routes/about",
          path: "]",
        },
      ],
      [
        "routes/about.[.].tsx",
        {
          file: "routes/about.[.].tsx",
          id: "routes/about.[.]",
          parentId: "routes/about",
          path: ".",
        },
      ],
      // TODO: talk with @pcattori
      // [
      //   "routes/about.[*].tsx",
      //   {
      //     file: "routes/about.[*].tsx",
      //     id: "routes/about.[*]",
      //     parentId: "routes/about",
      //     path: "*",
      //   },
      // ],
      [
        "routes/about.[.[.*].].tsx",
        {
          file: "routes/about.[.[.*].].tsx",
          id: "routes/about.[.[.*].]",
          parentId: "routes/about",
          path: ".[.*/]",
        },
      ],

      // Optional route segments
      [
        "routes/(nested)/_layout/($slug).tsx",
        {
          file: "routes/(nested)/_layout/($slug).tsx",
          id: "routes/(nested)/_layout/($slug)",
          parentId: "root",
          path: "nested?/:slug?",
        },
      ],
      [
        "routes/(routes)/$.tsx",
        {
          file: "routes/(routes)/$.tsx",
          id: "routes/(routes)/$",
          parentId: "root",
          path: "routes?/*",
        },
      ],
      [
        "routes/(routes).(sub)/$.tsx",
        {
          file: "routes/(routes).(sub)/$.tsx",
          id: "routes/(routes).(sub)/$",
          parentId: "root",
          path: "routes?/sub?/*",
        },
      ],
      [
        "routes/(routes)/($slug).tsx",
        {
          file: "routes/(routes)/($slug).tsx",
          id: "routes/(routes)/($slug)",
          parentId: "root",
          path: "routes?/:slug?",
        },
      ],
      [
        "routes/(routes).sub/($slug).tsx",
        {
          file: "routes/(routes).sub/($slug).tsx",
          id: "routes/(routes).sub/($slug)",
          parentId: "root",
          path: "routes?/sub/:slug?",
        },
      ],
      [
        "routes/(nested)/$.tsx",
        {
          file: "routes/(nested)/$.tsx",
          id: "routes/(nested)/$",
          parentId: "root",
          path: "nested?/*",
        },
      ],
      [
        "routes/(flat).$.tsx",
        {
          file: "routes/(flat).$.tsx",
          id: "routes/(flat).$",
          parentId: "root",
          path: "flat?/*",
        },
      ],
      [
        "routes/(flat).($slug).tsx",
        {
          file: "routes/(flat).($slug).tsx",
          id: "routes/(flat).($slug)",
          parentId: "root",
          path: "flat?/:slug?",
        },
      ],
      [
        "routes/flat.(sub).tsx",
        {
          file: "routes/flat.(sub).tsx",
          id: "routes/flat.(sub)",
          parentId: "root",
          path: "flat/sub?",
        },
      ],
      [
        "routes/_layout.tsx",
        {
          file: "routes/_layout.tsx",
          id: "routes/_layout",
          parentId: "root",
          path: undefined,
        },
      ],
      [
        "routes/_layout.(test).tsx",
        {
          file: "routes/_layout.(test).tsx",
          id: "routes/_layout.(test)",
          parentId: "routes/_layout",
          path: "test?",
        },
      ],
      [
        "routes/_layout/($slug).tsx",
        {
          file: "routes/_layout/($slug).tsx",
          id: "routes/_layout/($slug)",
          parentId: "routes/_layout",
          path: ":slug?",
        },
      ],

      // Optional + escaped route segments
      [
        "routes/([index]).tsx",
        {
          file: "routes/([index]).tsx",
          id: "routes/([index])",
          parentId: "root",
          path: "index?",
        },
      ],
      [
        "routes/([i]ndex)/([[]).([[]]).tsx",
        {
          file: "routes/([i]ndex)/([[]).([[]]).tsx",
          id: "routes/([i]ndex)/([[]).([[]])",
          parentId: "routes/([index])",
          path: "[?/[]?",
        },
      ],
      [
        "routes/(sub).([[]).tsx",
        {
          file: "routes/(sub).([[]).tsx",
          id: "routes/(sub).([[])",
          parentId: "root",
          path: "sub?/[?",
        },
      ],
      [
        "routes/(sub).(]).tsx",
        {
          file: "routes/(sub).(]).tsx",
          id: "routes/(sub).(])",
          parentId: "root",
          path: "sub?/]?",
        },
      ],
      [
        "routes/(sub).([[]]).tsx",
        {
          file: "routes/(sub).([[]]).tsx",
          id: "routes/(sub).([[]])",
          parentId: "root",
          path: "sub?/[]?",
        },
      ],
      [
        "routes/(beef]).tsx",
        {
          file: "routes/(beef]).tsx",
          id: "routes/(beef])",
          parentId: "root",
          path: "beef]?",
        },
      ],
      [
        "routes/(test)/(inde[x]).tsx",
        {
          file: "routes/(test)/(inde[x]).tsx",
          id: "routes/(test)/(inde[x])",
          parentId: "root",
          path: "test?/index?",
        },
      ],
      [
        "routes/($[$dollabills]).([.]lol)/(what)/([$]).($up).tsx",
        {
          file: "routes/($[$dollabills]).([.]lol)/(what)/([$]).($up).tsx",
          id: "routes/($[$dollabills]).([.]lol)/(what)/([$]).($up)",
          parentId: "root",
          path: ":$dollabills?/.lol?/what?/$?/:up?",
        },
      ],
      [
        "routes/(posts)/($slug)/([image.jpg]).tsx",
        {
          file: "routes/(posts)/($slug)/([image.jpg]).tsx",
          id: "routes/(posts)/($slug)/([image.jpg])",
          parentId: "root",
          path: "posts?/:slug?/image.jpg?",
        },
      ],
      [
        "routes/(sub)/([sitemap.xml]).tsx",
        {
          file: "routes/(sub)/([sitemap.xml]).tsx",
          id: "routes/(sub)/([sitemap.xml])",
          parentId: "root",
          path: "sub?/sitemap.xml?",
        },
      ],
      [
        "routes/(sub)/[(sitemap.xml)].tsx",
        {
          file: "routes/(sub)/[(sitemap.xml)].tsx",
          id: "routes/(sub)/[(sitemap.xml)]",
          parentId: "root",
          path: "sub?/(sitemap.xml)",
        },
      ],
      [
        "routes/($slug[.]json).tsx",
        {
          file: "routes/($slug[.]json).tsx",
          id: "routes/($slug[.]json)",
          parentId: "root",
          path: ":slug.json?",
        },
      ],

      [
        "routes/[]otherstuff].tsx",
        {
          file: "routes/[]otherstuff].tsx",
          id: "routes/[]otherstuff]",
          parentId: "root",
          path: "otherstuff]",
        },
      ],
      [
        "routes/$.tsx",
        { file: "routes/$.tsx", id: "routes/$", parentId: "root", path: "*" },
      ],
    ];

    let routeManifest = flatRoutesUniversal(
      APP_DIR,
      files.map(([file]) => path.join(APP_DIR, file))
    );
    let routes = Object.values(routeManifest);

    expect(routes).toHaveLength(files.length);

    for (let [file, route] of files) {
      test(`hierarchy for ${file} - ${route.path}`, () => {
        expect(routes).toContainEqual(route);
      });
    }
  });

  test("should error when using `/` in a route segment", () => {
    let files: string[] = [
      "routes/($[$dollabills]).([.]lol)[/](what)/([$]).$.tsx",
    ];

    expect(() =>
      flatRoutesUniversal(
        APP_DIR,
        files.map((file) => path.join(APP_DIR, file))
      )
    ).toThrowError(
      `Route segment cannot contain a slash: .lol?/what? (in route ($[$dollabills]).([.]lol)[/](what)/([$]).$)`
    );
  });
});
