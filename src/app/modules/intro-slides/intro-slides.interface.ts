export interface ISlides {
  is_viewed: boolean;
  slide: {
    image: string;
    message: string;
    rank: number;
    title: string;
    selected: boolean;
  };
}
