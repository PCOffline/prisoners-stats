interface Prisoner {
  age: `${number}`;
  arrest_date: string;
  birth: string;
  city: string;
  ciztizenship: 'לא' | 'כן';
  duration: 'במעצר' | `${number}--${number}--${number}`;
  court: 'בית דין צבאי' | 'בית משפט אזרחי' | 'בית דין צבאי + בית משפט אזרחי';
  gender: 'זכר' | 'נקבה';
  id: `${number}`;
  id_type: 'שטחים' | 'כחולה' | 'שטחים ';
  name: string;
  number: `${number}`;
  offense: string;
  organization: 'ללא' | 'פת"ח' | 'חמאס' | 'גא"פ' | 'חז"ד' | 'חז"ע';
  type: 'עצור' | 'שפוט';
}

interface APIResponse {
  Results: Array<{
    Data: Prisoner & { totalresults: number };
    Description: string | null;
    UrlName: string | null;
  }>;
  TotalResults: number;
}

async function* fetchPrisoners(): AsyncGenerator<Prisoner[]> {
  const JUMPS = 20;
  let index = 0;

  let response: APIResponse;

  do {
    response = await (
      await fetch('https://www.gov.il/he/api/DataGovProxy/GetDGResults', {
        headers: {
          accept: 'application/json, text/plain, */*',
          'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,he;q=0.7,ru;q=0.6',
          'content-type': 'application/json;charset=UTF-8',
          'sec-ch-ua':
            '"Chromium";v="118", "Opera GX";v="104", "Not=A?Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'sec-gpc': '1',
          cookie:
            '__cf_bm=as4.OHJQZ.FNJoMUJg.HQFExY.CvhjL0s4tG0PO_tlQ-1700691553-0-AYelah8yQk/nrlJzglF3ASgcH+8j8X6GtzrWJbFdShaC/tTZw53dm9T5/QDruXXFVUeGsFlrugQBYJJhBzInAlo=; cf_clearance=mUSBJqaP4C7eqb7iWWmL2c4hPJOtZ01SG5cx6izP_N0-1700691556-0-1-8b9671a5.c02a48ca.dc972e45-0.2.1700691556; p_hosting=!neD09u6YU9+tIH9fqY6LhGpDM7T+i1Nytie+/iDsD0HCJo4TAB4wuV/A2oY+P2J5J/05VCV82bpgkA==; TS016f2f2d=0124934a818632907ec87fc07153bb5b7f08db3adb2279282d0b5bd985f8e22b7d907380e2523255317a485b9195015bac4421423d4f8b1af442780d4d5e4ca443588d468a0c7555401a2b301c76f1423b894abb54',
          Referer: `https://www.gov.il/he/Departments/DynamicCollectors/is-db?skip=${
            index - JUMPS
          }`,
          'Referrer-Policy': 'unsafe-url',
        },
        body: `{"DynamicTemplateID":"c0bc61c0-94ce-4f8f-bde5-d63d057e231b","QueryFilters":{"skip":{"Query":${index}}},"From":${index}}`,
        method: 'POST',
      })
    ).json();
    index += JUMPS;
    yield response.Results.map(
      ({ Data: { totalresults: _, ...prisoner } }) => prisoner,
    );
  } while (response.Results.length > 0);
}

async function collectAllPrisoners(): Promise<Prisoner[]> {
  const prisoners = [];
  for await (const prisonersBatch of fetchPrisoners()) {
    prisoners.push(...prisonersBatch);
  }

  return prisoners;
}

type MapOfInterests = {
  [Key in
    | 'organization'
    | 'id_type'
    | 'ciztizenship'
    | 'court'
    | 'gender'
    | 'type']: Set<Prisoner[Key]>;
};

async function analyseFieldsOfInterest(): Promise<MapOfInterests> {
  const prisoners = await collectAllPrisoners();

  const fieldsOfInterest = [
    'organization',
    'id_type',
    'ciztizenship',
    'court',
    'gender',
    'type',
  ] as const satisfies ReadonlyArray<keyof Prisoner>;

  return prisoners.reduce((acc, prisoner) => {
    fieldsOfInterest.forEach((field) =>
      acc[field]
        ? acc[field].add(prisoner[field] as never)
        : (acc[field] = new Set([prisoner[field]]) as any),
    );
    return acc;
  }, {} as MapOfInterests);
}

async function getArrestsAfterOctoberSeventh(): Promise<Prisoner[]> {
  const prisoners = await collectAllPrisoners();

  return prisoners.filter(
    ({ arrest_date }) => new Date(arrest_date) > new Date('2023-10-07'),
  );
}

async function getPercentages<T extends keyof Prisoner>(field: T): Promise<Record<Prisoner[T], number>> {
  const prisoners = await collectAllPrisoners();

  const counts = prisoners.reduce((acc, prisoner) => {
    const key = prisoner[field];
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {} as Record<Prisoner[T], number>);

  const total = prisoners.length;
  return Object.keys(counts).reduce((acc, key) => ({ ...acc, [key]: (counts[key as Prisoner[T]] ?? 0) / total * 100}), {} as Record<Prisoner[T], number>)
}

