/**
 * HL7 FHIR R4 Diagnostic Document Generator
 * Generates an Ayushman Bharat Digital Mission (ABDM) compliant FHIR R4 Bundle
 */

export interface PatientDataForFhir {
  id?: string;
  patientCode: string;
  age: number;
  gender: string;
  icdrGrade: number;
  gradeLabel: string;
  riskScore: number;
  etdrsConcordance?: string | any[];
  fundusType?: string;
  notes?: string;
  macularInvolvement?: boolean;
}

export const generateFhirR4Bundle = (data: PatientDataForFhir) => {
  const timestamp = new Date().toISOString();
  const bundleId = `urn:uuid:rf360-${Date.now()}`;
  const patientId = `urn:uuid:patient-${data.patientCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const observationId = `urn:uuid:obs-${Date.now()}`;
  const diagnosticReportId = `urn:uuid:diag-${Date.now()}`;
  const serviceRequestId = `urn:uuid:sr-${Date.now()}`;

  return {
    resourceType: "Bundle",
    id: bundleId,
    meta: {
      versionId: "1",
      lastUpdated: timestamp,
      profile: [
        "https://nrces.in/ndhm/fhir/r4/StructureDefinition/DiagnosticReportRecord"
      ]
    },
    identifier: {
      system: "https://retina-fusion-360.health.gov.in/bundles",
      value: `BUNDLE-${data.patientCode}-${Date.now()}`
    },
    type: "document",
    timestamp: timestamp,
    entry: [
      {
        fullUrl: "urn:uuid:composition-01",
        resource: {
          resourceType: "Composition",
          id: "composition-01",
          status: "final",
          type: {
            coding: [
              {
                system: "http://loinc.org",
                code: "11502-2",
                display: "Laboratory report"
              }
            ],
            text: "Diabetic Retinopathy Automated Screening & Triage Report"
          },
          subject: {
            reference: patientId,
            display: `Patient ${data.patientCode}`
          },
          date: timestamp,
          author: [
            {
              display: "RETINA-FUSION 360 Edge CDSS Inference Engine v2.4"
            }
          ],
          title: "AI-Assisted Retinal Diagnostic Summary"
        }
      },
      {
        fullUrl: patientId,
        resource: {
          resourceType: "Patient",
          id: patientId.replace("urn:uuid:", ""),
          identifier: [
            {
              type: {
                coding: [
                  {
                    system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                    code: "MR",
                    display: "Medical Record Number"
                  }
                ]
              },
              system: "https://healthid.ndhm.gov.in",
              value: "91-4820-8192-3841"
            }
          ],
          active: true,
          name: [
            {
              use: "official",
              text: `Subject ${data.patientCode}`
            }
          ],
          gender: data.gender.toLowerCase() === "female" ? "female" : "male",
          telecom: [
            {
              system: "phone",
              value: "+91 98765 43210"
            }
          ],
          address: [
            {
              use: "home",
              state: "Maharashtra",
              country: "IND"
            }
          ]
        }
      },
      {
        fullUrl: observationId,
        resource: {
          resourceType: "Observation",
          id: observationId.replace("urn:uuid:", ""),
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/observation-category",
                  code: "exam",
                  display: "Exam"
                }
              ]
            }
          ],
          code: {
            coding: [
              {
                system: "http://snomed.info/sct",
                code: "4855003",
                display: "Diabetic retinopathy (disorder)"
              }
            ],
            text: "ICDR Diabetic Retinopathy Classification"
          },
          subject: {
            reference: patientId
          },
          effectiveDateTime: timestamp,
          valueCodeableConcept: {
            coding: [
              {
                system: "http://hl7.org/fhir/sid/icd-10",
                code: data.icdrGrade >= 3 ? "H36.03" : "H36.01",
                display: data.gradeLabel
              }
            ],
            text: data.gradeLabel
          },
          component: [
            {
              code: {
                text: "ETDRS 4-2-1 Rule Concordance"
              },
              valueString: Array.isArray(data.etdrsConcordance) ? data.etdrsConcordance.join(', ') : (data.etdrsConcordance || 'Concordant')
            },
            {
              code: {
                text: "Sight-Threat Risk Score"
              },
              valueQuantity: {
                value: data.riskScore,
                unit: "%",
                system: "http://unitsofmeasure.org",
                code: "%"
              }
            },
            {
              code: {
                text: "Macular Edema Involvement"
              },
              valueBoolean: !!data.macularInvolvement
            }
          ]
        }
      },
      {
        fullUrl: diagnosticReportId,
        resource: {
          resourceType: "DiagnosticReport",
          id: diagnosticReportId.replace("urn:uuid:", ""),
          status: "final",
          code: {
            text: "Retinal Optical Fundus Tele-Screening Report"
          },
          subject: {
            reference: patientId
          },
          conclusion: data.notes || `Screening completed with grade: ${data.gradeLabel}. Risk score ${data.riskScore}%.`,
          result: [
            {
              reference: observationId
            }
          ]
        }
      },
      {
        fullUrl: serviceRequestId,
        resource: {
          resourceType: "ServiceRequest",
          id: serviceRequestId.replace("urn:uuid:", ""),
          status: "active",
          intent: "order",
          priority: data.icdrGrade >= 3 ? "urgent" : "routine",
          code: {
            coding: [
              {
                system: "http://snomed.info/sct",
                code: "392019001",
                display: "Tele-ophthalmology referral service"
              }
            ],
            text: "e-Sanjeevani Vitreo-Retinal Specialist Consultation"
          },
          subject: {
            reference: patientId
          }
        }
      }
    ]
  };
};

/**
 * Generates and downloads FHIR R4 Bundle JSON file
 */
export const downloadFhirR4Bundle = (data: PatientDataForFhir) => {
  const bundle = generateFhirR4Bundle(data);
  const jsonStr = JSON.stringify(bundle, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `FHIR_R4_Bundle_${data.patientCode.replace(/[^a-zA-Z0-9_-]/g, "_")}_${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return bundle;
};
