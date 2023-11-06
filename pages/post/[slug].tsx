import PortableText from "react-portable-text";
import Footer from "../../components/Footer"
import Header from "../../components/Header"
import { sanityClient, urlFor } from "../../sanity";
import { Post } from "../../typings";
import Image from "next/image";

interface Props {
    post: Post
}

const Post = ({ post }: Props) => {
    return <div>
        <Header />
        {/* main Image */}
        <Image
            className="w-full h-96 object-cover"
            src={urlFor(post.mainImage).url()!}
            alt="coverImage"
            width={1200}
            height={354}
        />
        {/* Article */}
        <div className="max-w-3xl mx-auto">
            <article className="w-full mx-auto p-5 bg-secondaryColor/10">
                <h1 className="font-titleFont font-medium text-[32px] text-primary border-b-[1px] border-b-cyan-800 mt-10 mb-3">{post.title}</h1>
                <h2 className="font-bodyFont text-[18px] text-gray-500 mb-2">{post.description}</h2>
                <div className="flex items-center gap-2">
                    <Image
                        className="rounded-full object-cover bg-red-400"
                        src={urlFor(post.author.image).url()}
                        alt="authorImg"
                        width={48}
                        height={48}
                    />
                    <p className="font-bodyFont text-base">
                        Blog post by {" "}
                        <span className="font-bold">
                            {post.author.name}
                        </span> - Published at {new Date(post.publishedAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="mt-10">
                <PortableText dataset={process.env.NEXT_PUBLIC_SANITY_DATASET || "production"}
                        projectId={
                            process.env.NEXT_PUBLIC_SANITY_ID || "bsrbs3xa"
                        }
                        content={post.body}
                        serializers={{
                            h1: (props: any) => (
                                <h1
                                className="text-3xl font-bold my-5 font-titleFont"
                                    {...props}
                                />
                            ),
                            h2: (props: any) => (
                                <h2
                                className="text-2xl font-bold my-5 font-titleFont"
                                    {...props}
                                />
                            ),
                            h3: (props: any) => (
                                <h3
                                className="text-2xl font-bold my-5 font-titleFont"
                                    {...props}
                                />
                            ),
                            li: ({ children }: any) => (
                                <li className="ml-4 py-2 list-disc">{children}</li>
                            ),
                            link: ({ href, children }: any) => (
                                <a href={href} className=" text-cyan-500 hover:underline">
                                    {children}
                                </a>
                            ),
                        }}
                        />
                </div>
            </article>
        </div>
        <Footer />
    </div>
}

export default Post;

export const getStaticPaths = async () => {
    const query = `*[_type == "post"] {
        _id,
          slug {
          current
          }
      }`;
    const posts = await sanityClient.fetch(query);
    const paths = posts.map((post: Post) => ({
        params: {
            slug: post.slug.current,
        }
    }));
    return {
        paths,
        fallback: "blocking",
    };
};

export const getStaticProps: GetstaticProps = async ({ params }) => {
    const query = `*[_type == "post" && slug.current == $slug][0] {
    _id,
      publishedAt,
      title,
      author -> {
        name,
        image,
      },
      description,
      mainImage,
      slug,
      body
  }`

    const post = await sanityClient.fetch(query, {
        slug: params?.slug,
    })

    if (!post) {
        return {
            notFound: true
        }
    }
    return {
        props: {
            post
        },
        revalidate: 60,
    }
}