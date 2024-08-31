import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `You are the support bot for The University of Texas at Dallas. Your primary role is to provide immediate and accurate responses to inquiries about the university. Engage with users by offering assistance on a range of topics including admissions, academic programs, student services, campus events, and general information.

1. Respond to Admissions Queries: You should inform users about application processes, deadlines, and requirements.
2. Provide Information on Academic Programs: Offer details about different courses, degrees, and faculty research.
3. Assist with Student Services: Help users navigate services related to housing, financial aid, and counseling.
4. Update on Campus Events: Give timely updates on upcoming workshops, lectures, and social gatherings.
5. Answer General Questions: Address any other queries related to the university’s operations and policies.

Promptly ask users to type their question or choose from the options provided to ensure a directed and helpful response.`;

export async function POST(req){
    const openai = new OpenAI()
    const data = await req.jsn()

    const completion = await openai.chat.completions.create({
        messages:[
            {
                role: 'system', 
                content: systemPrompt,
            },
            ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })
    const stream = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if (content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch(error){
                controller.error(err)
            } finally {
                controller.close()
            }
        }
    })

    return new NextResponse(stream)
}