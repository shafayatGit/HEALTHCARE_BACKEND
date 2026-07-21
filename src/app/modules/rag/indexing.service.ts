import { prisma } from "../../lib/prisma";
import { EmbeddingService } from "./embedding.service";
import { Prisma } from "../../../generated/prisma/client";

const toVectorLiteral = (vector: number[]) => {
  return `[${vector.join(",")}]`;
};

export class IndexingService {
  private embeddingService: EmbeddingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  async indexDocument(
    chunkKey: string,
    sourceType: string,
    sourceId: string,
    sourceLebel: string | null = null,
    content: string,
    metadata?: Record<string, unknown>,
  ) {
    try {
      const embedding = await this.embeddingService.generateEmbedding(content);
      const vectorLiteral = toVectorLiteral(embedding);

      await prisma.$executeRaw(Prisma.sql`INSERT INTO "document_embeddings" 
        ("id", "chunkKey", "sourceType", "sourceId", "sourceLebel", "content", "metadata", "embedding", "updatedAt") 
        VALUES (
          gen_random_uuid(),
          ${chunkKey},
          ${sourceType},
          ${sourceId},
          ${sourceLebel},
          ${content},
          ${JSON.stringify(metadata || {})}::jsonb,
          CAST(${vectorLiteral} AS VECTOR),
          NOW()
        )
        ON CONFLICT ("chunkKey") DO UPDATE SET
          "sourceType" = EXCLUDED."sourceType",
          "sourceId" = EXCLUDED."sourceId",
          "sourceLebel" = EXCLUDED."sourceLebel",
          "content" = EXCLUDED."content",
          "metadata" = EXCLUDED."metadata",
          "embedding" = EXCLUDED."embedding",
          "isDeleted" = false,
          "deletedAt" = NULL,
          "updatedAt" = NOW();
      `);
    } catch (error) {
      console.log(error);
    }
  }

  async indexDoctorsData() {
    try {
      console.log("Fetching doctors data from the database for indexing");
      const doctors = await prisma.doctor.findMany({
        where: {
          isDeleted: false,
        },
        include: {
          specialties: {
            include: {
              specialty: true,
            },
          },
          reviews: true,
        },
      });
      let indexedCount = 0;

      //Format Speciality List
      for (const doctor of doctors) {
        const specialityList = doctor.specialties
          .map((ds) => ds.specialty.title)
          .join("\n");

        //Format Reviews List
        const reviewsList = doctor.reviews.map(
          (review) =>
            `Rating: ${review.rating}/5. Comment: ${review.comment || "No comment"}`,
        );

        //Format Doctor Data
        const content = `
                Doctor Name: ${doctor.name}
                Experience: ${doctor.experience} years
                Designation: ${doctor.designation}
                Appointment Fee: ${doctor.appointmentFee}
                Current Working: ${doctor.currentWorkingPlace}
                Average Rating: ${doctor.averageRating}
                Specialities: ${specialityList}
                Reviews: ${reviewsList || "No reviews"}
                `;

        const metaData = {
          doctorId: doctor.id,
          name: doctor.name,
          specialities: doctor.specialties,
          averageRating: doctor.averageRating,
          experince: doctor.experience,
        };

        const chunkKey = `doctor-${doctor.id}`;

        await this.indexDocument(
          chunkKey,
          "Doctor",
          doctor.id,
          doctor.name,
          content,
          metaData,
        );

        indexedCount++;
      }

      console.log(`Successfully Indexed ${indexedCount} Doctors`);
      return {
        success: true,
        message: `Successfully Indexed ${indexedCount} Doctors`,
      };
    } catch (error) {
      console.error(error);
      throw new Error("Failed to index doctors data");
    }
  }
}
